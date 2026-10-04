import { connectDatabase, disconnectDatabase } from "../config/database.config";
import { User } from "../models/user.model";
import { Order } from "../models/order.model";
import { logger } from "../utils/logger";

async function seedDriver() {
  logger.info("🚴 Seeding test driver and ready orders...");
  await connectDatabase();

  // 1. Upsert Driver Account
  const driverEmail = "driver@chowly.com";
  let driver = await User.findOne({ email: driverEmail });

  if (!driver) {
    driver = new User({
      name: "Tunde A.",
      email: driverEmail,
      password: "Password123!",
      phone: "+44 7700 900111",
      role: "rider",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      isVerified: true,
    });
    await driver.save();
    logger.info("✅ Created test driver: Tunde A. (driver@chowly.com / Password123!)");
  } else {
    driver.name = "Tunde A.";
    driver.role = "rider";
    driver.password = "Password123!";
    driver.phone = "+44 7700 900111";
    await driver.save();
    logger.info("✅ Updated test driver: Tunde A. (driver@chowly.com / Password123!)");
  }

  // 2. Upsert Sample Ready Orders matching driver mockups
  const sampleOrders = [
    {
      orderNumber: "CH-6401",
      restaurantName: "Mama Chow's Kitchen",
      restaurantAddress: "3 Hoe Street, Walthamstow, London E17 4SD",
      deliveryAddress: {
        label: "Home",
        fullAddress: "14 Bramley Road, Walthamstow, E17 6QT",
        contactPhone: "+44 7700 900222",
        instructions: "Ring doorbell twice, 2nd floor flat",
      },
      arrivalEstimate: "20-30 min",
      estimatedDeliveryTime: new Date(Date.now() + 25 * 60000),
      items: [
        {
          name: "Crispy Chilli Beef",
          subtitle: "With egg fried rice",
          image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&auto=format&fit=crop&q=80",
          price: 13.5,
          quantity: 1,
          itemTotal: 13.5,
        },
        {
          name: "Steamed Dim Sum Platter",
          subtitle: "6 pieces prawn & chicken dumplings",
          image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80",
          price: 9.2,
          quantity: 1,
          itemTotal: 9.2,
        },
        {
          name: "Jasmine Blossom Iced Tea",
          subtitle: "500ml cold brew",
          image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80",
          price: 3.8,
          quantity: 1,
          itemTotal: 3.8,
        },
      ],
      pricing: {
        subtotal: 26.5,
        deliveryFee: 2.5,
        serviceFee: 1.5,
        discount: 0,
        total: 30.5,
        currency: "INR" as const,
      },
      payment: {
        method: "card" as const,
        status: "succeeded" as const,
        amountInPaise: 3050,
        cardBrand: "visa",
        cardLast4: "4242",
      },
      status: "ready" as const,
      statusHistory: [
        {
          status: "placed" as const,
          title: "Order Placed",
          timestamp: new Date(Date.now() - 20 * 60000),
        },
        {
          status: "preparing" as const,
          title: "In the Kitchen",
          timestamp: new Date(Date.now() - 15 * 60000),
        },
        {
          status: "ready" as const,
          title: "Order Ready",
          note: "Food packed and waiting for courier pickup",
          timestamp: new Date(Date.now() - 2 * 60000),
        },
      ],
      includeCutlery: true,
      orderNotes: "Extra napkins please",
    },
    {
      orderNumber: "CH-5802",
      restaurantName: "Bosco Pizza Co.",
      restaurantAddress: "Old Street Roundabout, London EC1V 1AB",
      deliveryAddress: {
        label: "Work",
        fullAddress: "88 Upper Street, Islington, N1 0NP",
        contactPhone: "+44 7700 900333",
        instructions: "Leave with front desk receptionist",
      },
      arrivalEstimate: "15-25 min",
      estimatedDeliveryTime: new Date(Date.now() + 20 * 60000),
      items: [
        {
          name: "Wood-Fired Margherita",
          subtitle: "Fresh basil, san marzano tomatoes",
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
          price: 12.0,
          quantity: 1,
          itemTotal: 12.0,
        },
        {
          name: "Garlic Dough Balls",
          subtitle: "Served with garlic butter dip",
          image: "https://images.unsplash.com/photo-1573821663912-569905455b1c?w=500&auto=format&fit=crop&q=80",
          price: 5.5,
          quantity: 1,
          itemTotal: 5.5,
        },
      ],
      pricing: {
        subtotal: 17.5,
        deliveryFee: 2.0,
        serviceFee: 1.2,
        discount: 0,
        total: 20.7,
        currency: "INR" as const,
      },
      payment: {
        method: "card" as const,
        status: "succeeded" as const,
        amountInPaise: 2070,
        cardBrand: "mastercard",
        cardLast4: "5555",
      },
      status: "ready" as const,
      statusHistory: [
        {
          status: "placed" as const,
          title: "Order Placed",
          timestamp: new Date(Date.now() - 18 * 60000),
        },
        {
          status: "ready" as const,
          title: "Order Ready",
          note: "Boxed hot and waiting for pickup",
          timestamp: new Date(Date.now() - 1 * 60000),
        },
      ],
      includeCutlery: false,
    },
  ];

  for (const orderData of sampleOrders) {
    await Order.findOneAndUpdate(
      { orderNumber: orderData.orderNumber },
      orderData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    logger.info(`📦 Seeded ready order: ${orderData.orderNumber} (${orderData.restaurantName})`);
  }

  logger.info("✨ Driver and sample orders seeded successfully!");
  await disconnectDatabase();
}

seedDriver()
  .then(() => process.exit(0))
  .catch(async (err) => {
    logger.error("❌ Seed driver failed", { error: err });
    try {
      await disconnectDatabase();
    } catch {}
    process.exit(1);
  });
