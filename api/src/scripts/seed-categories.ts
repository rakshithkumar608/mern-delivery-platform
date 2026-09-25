import path from "path";
import fs from "fs";
import { connectDatabase, disconnectDatabase } from "../config/database.config";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "../config/cloudinary.config";
import { Category } from "../models/category.model";
import { logger } from "../utils/logger";

interface CategorySeedData {
  name: string;
  slug: string;
  filename: string;
  backgroundColor: string;
  textColor: string;
  displayOrder: number;
}

const CATEGORY_DEFINITIONS: CategorySeedData[] = [
  {
    name: "Offers",
    slug: "offers",
    filename: "offer.png",
    backgroundColor: "#FEE2E2",
    textColor: "#DC2626",
    displayOrder: 1,
  },
  {
    name: "Burgers",
    slug: "burgers",
    filename: "burger.png",
    backgroundColor: "#FFF3E0",
    textColor: "#D97706",
    displayOrder: 2,
  },
  {
    name: "Pizza",
    slug: "pizza",
    filename: "pizza.png",
    backgroundColor: "#FFE4E6",
    textColor: "#E11D48",
    displayOrder: 3,
  },
  {
    name: "Sushi",
    slug: "sushi",
    filename: "sushi.png",
    backgroundColor: "#EDE9FE",
    textColor: "#7C3AED",
    displayOrder: 4,
  },
  {
    name: "Healthy",
    slug: "healthy",
    filename: "healthy.png",
    backgroundColor: "#DCFCE7",
    textColor: "#16A34A",
    displayOrder: 5,
  },
  {
    name: "Desserts",
    slug: "desserts",
    filename: "desserts.png",
    backgroundColor: "#FCE7F3",
    textColor: "#DB2777",
    displayOrder: 6,
  },
  {
    name: "Drinks",
    slug: "drinks",
    filename: "drinks.png",
    backgroundColor: "#E0F2FE",
    textColor: "#0284C7",
    displayOrder: 7,
  },
  {
    name: "Jollof",
    slug: "jollof",
    filename: "jollof.png",
    backgroundColor: "#FEF3C7",
    textColor: "#B45309",
    displayOrder: 8,
  },
];

async function seedCategories() {
  logger.info("🌱 Starting category seeding...");
  await connectDatabase();

  const cloudinaryReady = isCloudinaryConfigured();
  if (cloudinaryReady) {
    logger.info("☁️ Cloudinary credentials detected! Uploading images to Cloudinary...");
  } else {
    logger.warn(
      "⚠️ Cloudinary credentials are not set in .env. Falling back to local static asset paths (/assets/category-imgs/)."
    );
    logger.warn(
      "👉 Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to api/.env, then re-run this seed script anytime to upload to Cloudinary!"
    );
  }

  const assetsDir = path.resolve(__dirname, "../../assets/category-imgs");

  for (const cat of CATEGORY_DEFINITIONS) {
    const filePath = path.join(assetsDir, cat.filename);
    let imageUrl = `/assets/category-imgs/${cat.filename}`;
    let cloudinaryPublicId = "";

    if (fs.existsSync(filePath)) {
      if (cloudinaryReady) {
        try {
          logger.info(`Uploading ${cat.filename} for category '${cat.name}'...`);
          const uploadResult = await uploadImageToCloudinary(
            filePath,
            "chowly/categories",
            `category_${cat.slug}`
          );
          imageUrl = uploadResult.secure_url;
          cloudinaryPublicId = uploadResult.public_id;
          logger.info(`Uploaded: ${imageUrl}`);
        } catch (uploadErr) {
          logger.error(
            `Failed to upload ${cat.filename} to Cloudinary, fallback to local path.`,
            { error: uploadErr instanceof Error ? uploadErr.message : String(uploadErr) }
          );
        }
      }
    } else {
      logger.warn(`Asset file not found at: ${filePath}`);
    }

    const categoryDoc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      {
        name: cat.name,
        slug: cat.slug,
        image: imageUrl,
        cloudinaryPublicId,
        backgroundColor: cat.backgroundColor,
        textColor: cat.textColor,
        displayOrder: cat.displayOrder,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    logger.info(`✅ Seeded category: ${categoryDoc.name} (${categoryDoc.slug}) - ${categoryDoc.image}`);
  }

  logger.info("✨ Category seeding completed successfully!");
  await disconnectDatabase();
}

seedCategories()
  .then(() => process.exit(0))
  .catch(async (error) => {
    logger.error("❌ Category seeding failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    try {
      await disconnectDatabase();
    } catch {}
    process.exit(1);
  });
