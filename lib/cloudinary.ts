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

/**
 * Upload une vidéo (fichier, base64 ou URL distante) vers Cloudinary. Utilisé
 * notamment pour réhéberger durablement une vidéo Instagram : les URL de
 * media_url renvoyées par l'API Meta sont temporaires (elles expirent au
 * bout de quelques heures/jours), donc on rapatrie le fichier une bonne fois
 * pour toutes sur notre propre compte Cloudinary plutôt que de dépendre du
 * lien Instagram.
 */
export async function uploadVideoCloudinary(source: string, folder = 'nabe/instagram') {
  const result = await cloudinary.uploader.upload(source, {
    folder,
    resource_type: 'video',
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export default cloudinary;
