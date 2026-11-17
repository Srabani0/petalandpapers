import { v2 as cloudinary } from "cloudinary";

// NFR-SEC-05: validate MIME type and file size server-side for every upload.
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function isAllowedImage(file: File) {
  return ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE;
}

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

if (isConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export class CloudinaryNotConfiguredError extends Error {
  constructor() {
    super("Cloudinary is not configured — set CLOUDINARY_* env vars to upload images.");
    this.name = "CloudinaryNotConfiguredError";
  }
}

/** Uploads a file buffer to Cloudinary under the given folder (e.g. "products"). */
export async function uploadImage(buffer: Buffer, folder: string) {
  if (!isConfigured()) throw new CloudinaryNotConfiguredError();

  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `petal-and-papers/${folder}`, resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

/** Uploads directly from a remote URL — Cloudinary fetches it server-side,
 * so no bytes pass through our server. Callers must only pass URLs they
 * trust (admin seeding, or stock image URLs looked up server-side). */
export async function uploadImageFromUrl(url: string, folder: string, opts: { publicId?: string } = {}) {
  if (!isConfigured()) throw new CloudinaryNotConfiguredError();

  const result = await cloudinary.uploader.upload(url, {
    folder: `petal-and-papers/${folder}`,
    resource_type: "image",
    ...(opts.publicId ? { public_id: opts.publicId, overwrite: false } : {}),
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string) {
  if (!isConfigured()) throw new CloudinaryNotConfiguredError();
  await cloudinary.uploader.destroy(publicId);
}
