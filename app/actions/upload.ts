'use server';

import { uploadToCloudinary } from '@/lib/cloudinary';

export async function uploadImageAction(fileData: string, folder: string = 'made4togethr') {
  try {
    if (!fileData) {
      return { success: false, error: 'No image data provided' };
    }

    const res = await uploadToCloudinary(fileData, folder);
    return {
      success: true,
      url: res.secure_url,
      publicId: res.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image to Cloudinary',
    };
  }
}
