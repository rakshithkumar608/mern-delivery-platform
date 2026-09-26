import { connectDatabase, disconnectDatabase } from "../config/database.config";
import { Restaurant } from "../models/restaurant.model";
import { MenuItem } from "../models/menu-item.model";
import { logger } from "../utils/logger";

interface SeedItem {
  name: string;
  description: string;
  price: number;
  calories?: number;
  image: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  isPopular?: boolean;
  sizes?: { label: string; price: number }[];
  extras?: { label: string; price: number }[];
  toppings?: { label: string; price: number }[];
  removables?: string[];
  allergens?: string[];
}

interface SeedRestaurant {
  name: string;
  slug: string;
  description: string;
  cuisineType: string[];
  coverImage: string;
  logo: string;
  rating: number;
  totalReviews: number;
  deliveryTime: string;
  distance: string;
  deliveryFee: number;
  minOrder: number;
  currency: string;
  openingHours: string;
  offer?: string;
  offerSubtitle?: string;
  allergensInfo?: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  location: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  items: SeedItem[];
}

const RESTAURANTS_DATA: SeedRestaurant[] = [
  {
    name: "Bella Italia",
    slug: "bella-italia",
    description:
      "Authentic wood-fired Neapolitan pizzas, freshly rolled handmade pasta, and artisan Italian desserts crafted with traditional ingredients.",
    cuisineType: ["Italian", "Pizza", "Pasta"],
    coverImage:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80",
    rating: 4.6,
    totalReviews: 812,
    deliveryTime: "25-35 min",
    distance: "1.2 miles",
    deliveryFee: 1.49,
    minOrder: 8.0,
    currency: "£",
    openingHours: "Closes 10:30 PM",
    offer: "20% off selected favourites",
    offerSubtitle: "Offer applies to items marked eligible.",
    allergensInfo:
      "All dishes may contain traces of gluten, dairy, celery, or nuts. Contact staff for allergy inquiries.",
    isFeatured: true,
    isActive: true,
    displayOrder: 1,
    location: {
      type: "Point",
      coordinates: [-0.1276, 51.5074],
      address: "42 Dean Street, Soho, London W1D 4PY",
    },
    items: [
      // Popular items
      {
        name: "Spaghetti Carbonara",
        description:
          "Spaghetti tossed with crispy guanciale, pecorino romano, egg yolk, and freshly cracked black pepper.",
        price: 6.49,
        image:
          "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80",
        category: "Pasta",
        rating: 4.6,
        reviewCount: 812,
        isPopular: true,
        sizes: [
          { label: "Regular", price: 0 },
          { label: "Large", price: 2.0 },
        ],
        toppings: [
          { label: "Extra Pecorino Romano", price: 1.0 },
          { label: "Crispy Pancetta", price: 1.5 },
        ],
        allergens: ["Gluten", "Dairy", "Eggs"],
      },
      {
        name: "Penne Arrabbiata",
        description:
          "Penne pasta in a fiery San Marzano tomato sauce infused with garlic, fresh basil, and red chilli flakes.",
        price: 5.49,
        image:
          "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
        category: "Pasta",
        rating: 4.5,
        reviewCount: 642,
        isPopular: true,
        sizes: [
          { label: "Regular", price: 0 },
          { label: "Large", price: 1.8 },
        ],
        toppings: [
          { label: "Fresh Burrata on top", price: 2.5 },
          { label: "Extra Chilli Flakes", price: 0.5 },
        ],
        allergens: ["Gluten"],
      },
      {
        name: "Tiramisu Classico",
        description:
          "Savoiardi ladyfingers soaked in espresso liqueur, layered with velvet mascarpone cream and dusted with raw cocoa.",
        price: 4.7,
        image:
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80",
        category: "Desserts",
        rating: 4.8,
        reviewCount: 410,
        isPopular: true,
        sizes: [{ label: "Single Slice", price: 0 }],
        toppings: [{ label: "Extra Chocolate Curls", price: 0.8 }],
        allergens: ["Gluten", "Dairy", "Eggs"],
      },
      // Pizza
      {
        name: "Classic Margherita",
        description:
          "San Marzano tomato sauce, fior di latte mozzarella, fresh basil and extra virgin olive oil.",
        price: 4.29,
        calories: 680,
        image:
          "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80",
        category: "Pizza",
        rating: 4.7,
        reviewCount: 520,
        isPopular: false,
        sizes: [
          { label: 'Regular (10")', price: 4.29 },
          { label: 'Large (12")', price: 5.49 },
          { label: 'Extra Large (14")', price: 6.49 },
        ],
        extras: [
          { label: "Extra Mozzarella", price: 1.0 },
          { label: "Rocket", price: 0.8 },
          { label: "Cherry Tomatoes", price: 0.8 },
        ],
        removables: ["No Cheese", "No Basil"],
        allergens: ["Milk", "Gluten"],
      },
      {
        name: "Diavola Spicy Salami",
        description:
          "Spicy Calabrian salami, crushed plum tomato sauce, mozzarella, chili oil, and fresh oregano.",
        price: 5.99,
        image:
          "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=80",
        category: "Pizza",
        rating: 4.6,
        reviewCount: 388,
        isPopular: false,
        sizes: [
          { label: '10" Medium', price: 0 },
          { label: '12" Large', price: 2.5 },
        ],
        toppings: [
          { label: "Jalapeños", price: 0.75 },
          { label: "Hot Honey Drizzle", price: 1.0 },
        ],
        allergens: ["Gluten", "Dairy"],
      },
      // Sides
      {
        name: "Garlic Bread with Herb Butter",
        description:
          "Freshly baked artisan sourdough baguette toasted golden with roasted garlic butter and sea salt.",
        price: 3.49,
        image:
          "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&auto=format&fit=crop&q=80",
        category: "Sides",
        rating: 4.5,
        reviewCount: 290,
        isPopular: false,
        sizes: [{ label: "Standard Portion", price: 0 }],
        toppings: [{ label: "Melted Mozzarella", price: 1.2 }],
        allergens: ["Gluten", "Dairy"],
      },
      {
        name: "Crispy Calamari Fritti",
        description:
          "Tender baby calamari rings dusted in seasoned flour, flash fried, served with lemon aioli.",
        price: 4.99,
        image:
          "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80",
        category: "Sides",
        rating: 4.6,
        reviewCount: 175,
        isPopular: false,
        sizes: [{ label: "Standard Portion", price: 0 }],
        toppings: [{ label: "Extra Lemon Aioli Dip", price: 0.75 }],
        allergens: ["Molluscs", "Gluten", "Eggs"],
      },
      // Drinks
      {
        name: "Coca-Cola Original 330ml",
        description: "Classic crisp, refreshing Coca-Cola can served ice cold.",
        price: 1.5,
        image:
          "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
        category: "Drinks",
        rating: 4.9,
        reviewCount: 890,
        isPopular: false,
        sizes: [{ label: "330ml Can", price: 0 }],
        toppings: [],
        allergens: [],
      },
      {
        name: "San Pellegrino Blood Orange",
        description:
          "Italian sparkling beverage with authentic Mediterranean blood orange juice.",
        price: 2.2,
        image:
          "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80",
        category: "Drinks",
        rating: 4.8,
        reviewCount: 230,
        isPopular: false,
        sizes: [{ label: "330ml Can", price: 0 }],
        toppings: [],
        allergens: [],
      },
    ],
  },
  {
    name: "Burger Palace",
    slug: "burger-palace",
    description:
      "Gourmet smashed beef burgers, hand-cut crispy fries, and thick handmade milkshakes.",
    cuisineType: ["American", "Burgers", "Fast Food"],
    coverImage:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&auto=format&fit=crop&q=80",
    rating: 4.7,
    totalReviews: 342,
    deliveryTime: "25-35 min",
    distance: "1.8 miles",
    deliveryFee: 2.49,
    minOrder: 10.0,
    currency: "$",
    openingHours: "Closes 11:00 PM",
    offer: "Free fries with double burgers",
    offerSubtitle: "Applies automatically at checkout.",
    allergensInfo: "Contains dairy, gluten, soy. Cooked in peanut oil.",
    isFeatured: true,
    isActive: true,
    displayOrder: 2,
    location: {
      type: "Point",
      coordinates: [-0.12, 51.51],
      address: "18 Oxford St, London W1D 1BS",
    },
    items: [
      {
        name: "Classic Cheeseburger",
        description:
          "Juicy smashed beef patty with cheddar cheese, crisp lettuce, tomato, pickles, and house secret sauce.",
        price: 8.99,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
        category: "Burgers",
        rating: 4.7,
        reviewCount: 342,
        isPopular: true,
        sizes: [
          { label: "Single Patty", price: 0 },
          { label: "Double Patty", price: 2.5 },
          { label: "Triple Patty", price: 4.5 },
        ],
        toppings: [
          { label: "Extra Cheddar", price: 1.0 },
          { label: "Smoked Bacon", price: 1.75 },
          { label: "Pickled Jalapeños", price: 0.75 },
        ],
        allergens: ["Gluten", "Dairy", "Mustard"],
      },
      {
        name: "BBQ Bacon Smash Burger",
        description:
          "Smoky hickory BBQ sauce, applewood smoked bacon, crispy fried onion strings, and sharp aged cheddar.",
        price: 11.49,
        image:
          "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&auto=format&fit=crop&q=80",
        category: "Burgers",
        rating: 4.8,
        reviewCount: 280,
        isPopular: true,
        sizes: [
          { label: "Regular", price: 0 },
          { label: "Double Patty", price: 2.5 },
        ],
        toppings: [
          { label: "Grilled Onions", price: 0.75 },
          { label: "Extra Bacon", price: 1.75 },
        ],
        allergens: ["Gluten", "Dairy"],
      },
      {
        name: "Loaded Golden Fries",
        description:
          "Crispy skin-on golden fries smothered in warm cheese sauce, diced bacon, and scallions.",
        price: 5.99,
        image:
          "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80",
        category: "Sides",
        rating: 4.6,
        reviewCount: 195,
        isPopular: false,
        sizes: [
          { label: "Regular", price: 0 },
          { label: "Large", price: 1.5 },
        ],
        toppings: [{ label: "Truffle Mayo", price: 1.0 }],
        allergens: ["Dairy"],
      },
      {
        name: "Salted Caramel Shake",
        description:
          "Hand-spun Madagascar vanilla bean ice cream blended with salted caramel syrup and whipped cream.",
        price: 6.99,
        image:
          "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80",
        category: "Drinks",
        rating: 4.9,
        reviewCount: 140,
        isPopular: true,
        sizes: [{ label: "16 oz", price: 0 }],
        toppings: [{ label: "Extra Whipped Cream & Caramel", price: 0.75 }],
        allergens: ["Dairy"],
      },
    ],
  },
  {
    name: "Sakura Sushi",
    slug: "sakura-sushi",
    description:
      "Artisan Japanese sushi, sashimi moriawase, and chef specialty signature maki rolls.",
    cuisineType: ["Japanese", "Sushi", "Asian"],
    coverImage:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=900&auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=200&auto=format&fit=crop&q=80",
    rating: 4.8,
    totalReviews: 215,
    deliveryTime: "30-40 min",
    distance: "2.1 miles",
    deliveryFee: 0,
    minOrder: 15.0,
    currency: "$",
    openingHours: "Closes 10:00 PM",
    offer: "Free delivery on all sushi orders",
    offerSubtitle: "No minimum spend required.",
    isFeatured: true,
    isActive: true,
    displayOrder: 3,
    location: {
      type: "Point",
      coordinates: [-0.13, 51.52],
      address: "88 Charlotte St, Fitzrovia, London W1T 4PW",
    },
    items: [
      {
        name: "Signature Dragon Roll (8 pcs)",
        description:
          "Crispy prawn tempura, avocado, cucumber topped with grilled eel, tobiko, and unagi glaze.",
        price: 14.99,
        image:
          "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&auto=format&fit=crop&q=80",
        category: "Sushi",
        rating: 4.9,
        reviewCount: 210,
        isPopular: true,
        sizes: [{ label: "8 Pieces", price: 0 }],
        toppings: [
          { label: "Spicy Mayo Drizzle", price: 0.5 },
          { label: "Extra Wasabi & Ginger", price: 0.5 },
        ],
        allergens: ["Fish", "Crustaceans", "Gluten", "Sesame"],
      },
      {
        name: "Spicy Salmon Maki Roll (8 pcs)",
        description:
          "Fresh Atlantic salmon, chili oil, scallions, crunchy tempura flakes, and Japanese mayo.",
        price: 12.49,
        image:
          "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500&auto=format&fit=crop&q=80",
        category: "Sushi",
        rating: 4.7,
        reviewCount: 165,
        isPopular: true,
        sizes: [{ label: "8 Pieces", price: 0 }],
        toppings: [{ label: "Avocado slices", price: 1.5 }],
        allergens: ["Fish", "Eggs", "Sesame"],
      },
      {
        name: "Steamed Edamame with Sea Salt",
        description: "Fresh tender soybean pods steamed and tossed in Maldon flaky sea salt.",
        price: 4.99,
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
        category: "Sides",
        rating: 4.6,
        reviewCount: 95,
        isPopular: false,
        sizes: [{ label: "Standard Bowl", price: 0 }],
        toppings: [{ label: "Spicy Togarashi Chili Salt", price: 0.5 }],
        allergens: ["Soya"],
      },
    ],
  },
  {
    name: "Taco Fiesta",
    slug: "taco-fiesta",
    description:
      "Authentic Mexican street tacos on handmade corn tortillas, fresh guac, and signature salsas.",
    cuisineType: ["Mexican", "Street Food", "Tacos"],
    coverImage:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=900&auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&auto=format&fit=crop&q=80",
    rating: 4.6,
    totalReviews: 198,
    deliveryTime: "20-30 min",
    distance: "0.9 miles",
    deliveryFee: 1.99,
    minOrder: 8.0,
    currency: "$",
    openingHours: "Closes 11:30 PM",
    isFeatured: false,
    isActive: true,
    displayOrder: 4,
    location: {
      type: "Point",
      coordinates: [-0.11, 51.5],
      address: "22 Camden High St, London NW1 0JH",
    },
    items: [
      {
        name: "Birria Quesatacos Trio",
        description:
          "Three crispy braised beef tacos with melted Oaxaca cheese, onions, cilantro, and rich dipping consommé.",
        price: 11.99,
        image:
          "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=80",
        category: "Tacos",
        rating: 4.8,
        reviewCount: 198,
        isPopular: true,
        sizes: [{ label: "3 Tacos", price: 0 }],
        toppings: [{ label: "Extra Consommé Dip", price: 1.5 }],
        allergens: ["Dairy"],
      },
      {
        name: "Fresh Tortilla Chips & Guacamole",
        description:
          "Hand-mashed Hass avocados with lime, cilantro, jalapeño, served with fresh tortilla chips.",
        price: 5.49,
        image:
          "https://images.unsplash.com/photo-1541288097308-7b8e3f58c4c6?w=500&auto=format&fit=crop&q=80",
        category: "Sides",
        rating: 4.7,
        reviewCount: 140,
        isPopular: false,
        sizes: [{ label: "Regular", price: 0 }],
        toppings: [{ label: "Salsa Verde Cup", price: 0.75 }],
        allergens: [],
      },
    ],
  },
  {
    name: "Burger Craft Co.",
    slug: "burger-craft-co",
    description:
      "Dry-aged custom beef smash burgers, butter-toasted potato buns, and gourmet truffle parmesan fries.",
    cuisineType: ["American", "Burgers"],
    coverImage:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=900&auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80",
    rating: 4.9,
    totalReviews: 412,
    deliveryTime: "15-25 min",
    distance: "0.7 miles",
    deliveryFee: 0,
    minOrder: 10.0,
    currency: "$",
    openingHours: "Closes 10:30 PM",
    isFeatured: false,
    isActive: true,
    displayOrder: 5,
    location: {
      type: "Point",
      coordinates: [-0.14, 51.51],
      address: "10 Carnaby St, Soho, London W1F 9PB",
    },
    items: [
      {
        name: "The Master Craft Smash",
        description:
          "Double 100% grass-fed beef smash patties, aged American cheddar, caramelized onions, house truffle aioli on brioche.",
        price: 10.99,
        image:
          "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&auto=format&fit=crop&q=80",
        category: "Burgers",
        rating: 4.9,
        reviewCount: 390,
        isPopular: true,
        sizes: [
          { label: "Double Patty", price: 0 },
          { label: "Triple Patty", price: 2.5 },
        ],
        toppings: [
          { label: "Fried Free-Range Egg", price: 1.5 },
          { label: "Crispy Bacon", price: 1.75 },
        ],
        allergens: ["Gluten", "Dairy", "Eggs"],
      },
    ],
  },
  {
    name: "Green Garden Bowl",
    slug: "green-garden-bowl",
    description:
      "Organic superfood poke bowls, fresh power greens, cold-pressed raw juices, and antioxidant acai bowls.",
    cuisineType: ["Healthy", "Salads", "Bowls"],
    coverImage:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80",
    rating: 4.7,
    totalReviews: 180,
    deliveryTime: "15-25 min",
    distance: "1.4 miles",
    deliveryFee: 1.49,
    minOrder: 8.0,
    currency: "$",
    openingHours: "Closes 9:00 PM",
    offer: "15% off vegan bowls",
    offerSubtitle: "Use code GREEN15",
    isFeatured: false,
    isActive: true,
    displayOrder: 6,
    location: {
      type: "Point",
      coordinates: [-0.15, 51.52],
      address: "5 Baker St, Marylebone, London W1U 8ED",
    },
    items: [
      {
        name: "Wild Salmon Superfood Bowl",
        description:
          "Grilled wild Alaskan salmon, quinoa, avocado, edamame, cucumber, pickled red cabbage, ginger miso dressing.",
        price: 13.99,
        image:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
        category: "Healthy",
        rating: 4.8,
        reviewCount: 155,
        isPopular: true,
        sizes: [
          { label: "Standard Bowl", price: 0 },
          { label: "Extra Protein Size", price: 3.5 },
        ],
        toppings: [
          { label: "Chia Seeds & Hemp", price: 0.75 },
          { label: "Extra Avocado Half", price: 1.5 },
        ],
        allergens: ["Fish", "Soya", "Sesame"],
      },
    ],
  },
];

async function seedRestaurants() {
  logger.info("🌱 Starting restaurant and menu items seeding...");
  await connectDatabase();

  for (const restoData of RESTAURANTS_DATA) {
    const { items, ...restaurantFields } = restoData;

    // Upsert restaurant document
    const restaurant = await Restaurant.findOneAndUpdate(
      { slug: restaurantFields.slug },
      restaurantFields,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    logger.info(`🏪 Seeded restaurant: ${restaurant.name} (${restaurant.slug})`);

    // Clean up existing menu items for this restaurant before reseeding to prevent duplicate items
    await MenuItem.deleteMany({ restaurantId: restaurant._id });

    // Insert menu items
    if (items && items.length > 0) {
      const itemsToInsert = items.map((item, index) => ({
        ...item,
        restaurantId: restaurant._id,
        displayOrder: index + 1,
        isAvailable: true,
      }));

      await MenuItem.insertMany(itemsToInsert);
      logger.info(`  🍽️ Inserted ${items.length} menu items for ${restaurant.name}`);
    }
  }

  logger.info("✨ Restaurant & menu items seeding completed successfully!");
  await disconnectDatabase();
}

seedRestaurants()
  .then(() => process.exit(0))
  .catch(async (error) => {
    logger.error("❌ Restaurant seeding failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    try {
      await disconnectDatabase();
    } catch {}
    process.exit(1);
  });
