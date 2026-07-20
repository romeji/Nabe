import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload une image (base64 ou url) vers Cloudinary dans le dossier "nabe/produits".
 */
export async function uploadImageCloudinary(file: string, folder = 'nabe/produits') {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Supprime une image Cloudinary à partir de son public_id.
 */
export async function deleteImageCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
