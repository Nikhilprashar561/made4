import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { uploadToCloudinary } from '../lib/cloudinary';

async function testUpload() {
  console.log('Testing Cloudinary upload...');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('API Key:', process.env.CLOUDINARY_CLOUD_API_KEY ? 'Present' : 'Missing');

  // Small 1x1 transparent PNG data URL to test upload
  const sampleDataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

  const res = await uploadToCloudinary(sampleDataUrl, 'made4togethr/test');
  console.log('✅ Upload Success!');
  console.log('URL:', res.secure_url);
  console.log('Public ID:', res.public_id);
}

testUpload().catch((err) => {
  console.error('❌ Cloudinary test failed:', err);
  process.exit(1);
});
