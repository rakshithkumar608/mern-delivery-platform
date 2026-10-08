import { connectDatabase, disconnectDatabase } from "../config/database.config";
import { User } from "../models/user.model";
import { logger } from "../utils/logger";

async function seedAdmin() {
  logger.info("🛡️ Seeding platform admin and partner accounts...");
  await connectDatabase();

  // 1. Upsert Platform Admin Account
  const adminEmail = "admin@chowly.com";
  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    admin = new User({
      name: "Platform Admin",
      email: adminEmail,
      password: "Admin123!",
      phone: "+44 7700 900000",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
      isVerified: true,
    });
    await admin.save();
    logger.info("✅ Created platform admin: admin@chowly.com / Admin123!");
  } else {
    admin.name = "Platform Admin";
    admin.role = "admin";
    admin.password = "Admin123!";
    admin.phone = "+44 7700 900000";
    admin.isVerified = true;
    await admin.save();
    logger.info("✅ Updated platform admin: admin@chowly.com / Admin123!");
  }

  // 2. Upsert Restaurant Partner Account for portal testing
  const restaurantEmail = "restaurant@chowly.com";
  let restaurantOwner = await User.findOne({ email: restaurantEmail });

  if (!restaurantOwner) {
    restaurantOwner = new User({
      name: "Mama Chow",
      email: restaurantEmail,
      password: "Partner123!",
      phone: "+44 7700 900888",
      role: "restaurant_owner",
      avatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&auto=format&fit=crop&q=80",
      isVerified: true,
    });
    await restaurantOwner.save();
    logger.info("✅ Created restaurant partner: restaurant@chowly.com / Partner123!");
  } else {
    restaurantOwner.name = "Mama Chow";
    restaurantOwner.role = "restaurant_owner";
    restaurantOwner.password = "Partner123!";
    restaurantOwner.phone = "+44 7700 900888";
    restaurantOwner.isVerified = true;
    await restaurantOwner.save();
    logger.info("✅ Updated restaurant partner: restaurant@chowly.com / Partner123!");
  }

  logger.info("✨ Admin & partner seeding complete!");
  await disconnectDatabase();
}

seedAdmin()
  .then(() => process.exit(0))
  .catch(async (err) => {
    logger.error("❌ Seed admin failed", { error: err });
    try {
      await disconnectDatabase();
    } catch {}
    process.exit(1);
  });
