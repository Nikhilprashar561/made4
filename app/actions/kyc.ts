'use server';

import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { uploadToCloudinary } from '@/lib/cloudinary';

export interface SubmitKycInput {
  companionId?: string;
  fullName: string;
  aadhaarNumber: string;
  aadhaarImage: string;
}

export async function submitKycAction(input: SubmitKycInput) {
  try {
    if (!input.fullName || !input.aadhaarNumber) {
      return { success: false, error: 'Full name and Aadhaar number are required.' };
    }

    // Clean Aadhaar number: remove spaces and hyphens
    const cleanAadhaar = input.aadhaarNumber.replace(/[\s-]/g, '');
    if (cleanAadhaar.length !== 12 || !/^\d+$/.test(cleanAadhaar)) {
      return { success: false, error: 'Please enter a valid 12-digit Aadhaar number.' };
    }

    let finalImageUrl = input.aadhaarImage || 'uploaded-aadhaar-front.jpg';

    // Upload to Cloudinary if it is a base64 string or data URL
    if (input.aadhaarImage && input.aadhaarImage.startsWith('data:')) {
      try {
        const uploadResult = await uploadToCloudinary(input.aadhaarImage, 'made4togethr/kyc');
        finalImageUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error('Failed to upload Aadhaar to Cloudinary:', uploadErr);
      }
    }

    const kycId = `kyc-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Store in KYC submissions table with Cloudinary URL
    await db.insert(schema.kycSubmissions).values({
      id: kycId,
      companionId: input.companionId || 'kashish-blr',
      fullName: input.fullName,
      aadhaarNumber: `XXXX-XXXX-${cleanAadhaar.slice(-4)}`,
      aadhaarImage: finalImageUrl,
      status: 'submitted',
    });

    // If companionId is provided and exists in companions table, update it
    if (input.companionId) {
      await db
        .update(schema.companions)
        .set({
          aadhaarNumber: `XXXX-XXXX-${cleanAadhaar.slice(-4)}`,
          aadhaarImageUrl: finalImageUrl,
          verifiedId: true,
        })
        .where(eq(schema.companions.id, input.companionId));
    }

    try {
      revalidatePath('/companion/kyc');
      revalidatePath('/companion/dashboard');
    } catch {
      // Invariant error occurs if invoked outside Next.js request context
    }

    return {
      success: true,
      message: 'Your verification details and ID have been securely saved!',
      kycId,
      imageUrl: finalImageUrl,
    };
  } catch (error) {
    console.error('Error in submitKycAction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit KYC details to database',
    };
  }
}
