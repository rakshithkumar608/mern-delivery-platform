import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Env } from "./env.config";
import { logger } from "../utils/logger";

cloudinary.config({
  cloud_name: Env.CLOUDINARY_CLOUD_NAME,
  api_key: Env.CLOUDINARY_API_KEY,
  api_secret: Env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Returns true if all required Cloudinary environment variables are set.
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(
    Env.CLOUDINARY_CLOUD_NAME &&
    Env.CLOUDINARY_API_KEY &&
    Env.CLOUDINARY_API_SECRET
  );
};

/**
 * Upload a local image file to Cloudinary
 */
export const uploadImageToCloudinary = async (
  filePath: string,
  folder = "chowly/categories",
  publicId?: string,
): Promise<UploadApiResponse> => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary credentials are not configured in .env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)"
    );
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      public_id: publicId,
      resource_type: "image",
      overwrite: true,
    });
    return result;
  } catch (error) {
    logger.error("Cloudinary upload failed", {
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

/**
 * Delete an asset from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!isCloudinaryConfigured()) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error("Failed to delete image from Cloudinary", {
      publicId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export { cloudinary };
