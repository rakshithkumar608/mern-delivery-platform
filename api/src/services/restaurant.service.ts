import mongoose from "mongoose";
import {
  Restaurant,
  IRestaurant,
  IRestaurantDocument,
} from "../models/restaurant.model";
import {
  MenuItem,
  IMenuItem,
  IMenuItemDocument,
} from "../models/menu-item.model";
import { NotFoundException } from "../utils/app-error";

export interface RestaurantQueryOptions {
  isFeatured?: boolean;
  cuisine?: string;
  category?: string;
  search?: string;
  limit?: number;
  page?: number;
}

export interface RestaurantDetailResult {
  restaurant: IRestaurantDocument;
  items: IMenuItemDocument[];
  categories: string[];
  popularItems: IMenuItemDocument[];
}

export class RestaurantService {
  /**
   * Get filtered/paginated list of restaurants
   */
  async getRestaurants(options: RestaurantQueryOptions = {}): Promise<{
    restaurants: IRestaurantDocument[];
    total: number;
  }> {
    const filter: Record<string, any> = { isActive: true };

    if (options.isFeatured !== undefined) {
      filter.isFeatured = options.isFeatured;
    }

    const queryTerm = options.cuisine || options.category;
    if (queryTerm && queryTerm.toLowerCase() !== "all") {
      filter.$or = [
        { cuisineType: { $regex: new RegExp(queryTerm, "i") } },
        { name: { $regex: new RegExp(queryTerm, "i") } },
      ];
    }

    if (options.search) {
      const searchRegex = new RegExp(options.search, "i");
      filter.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { cuisineType: { $regex: searchRegex } },
      ];
    }

    const limit = Math.min(Math.max(options.limit || 20, 1), 50);
    const page = Math.max(options.page || 1, 1);
    const skip = (page - 1) * limit;

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .sort({ isFeatured: -1, rating: -1, displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Restaurant.countDocuments(filter).exec(),
    ]);

    return { restaurants, total };
  }

  /**
   * Get restaurant details + full menu by ID or slug
   */
  async getRestaurantByIdOrSlug(idOrSlug: string): Promise<RestaurantDetailResult> {
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    let restaurant: IRestaurantDocument | null = null;

    if (isObjectId) {
      restaurant = await Restaurant.findById(idOrSlug).exec();
    }
    if (!restaurant) {
      restaurant = await Restaurant.findOne({
        slug: idOrSlug.toLowerCase(),
      }).exec();
    }

    if (!restaurant) {
      throw new NotFoundException(`Restaurant '${idOrSlug}' not found`);
    }

    // Fetch all active menu items for this restaurant
    const items = await MenuItem.find({
      restaurantId: restaurant._id,
      isAvailable: true,
    })
      .sort({ displayOrder: 1, createdAt: 1 })
      .exec();

    // Extract unique categories preserving item order
    const rawCategories = Array.from(new Set(items.map((i) => i.category)));
    const categories = rawCategories.filter(Boolean);

    const popularItems = items.filter((item) => item.isPopular);

    return {
      restaurant,
      items,
      categories,
      popularItems,
    };
  }

  /**
   * Create restaurant (admin)
   */
  async createRestaurant(data: Partial<IRestaurant>): Promise<IRestaurantDocument> {
    const restaurant = new Restaurant(data);
    return restaurant.save();
  }

  /**
   * Update restaurant (admin)
   */
  async updateRestaurant(
    id: string,
    data: Partial<IRestaurant>
  ): Promise<IRestaurantDocument> {
    const restaurant = await Restaurant.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID '${id}' not found`);
    }
    return restaurant;
  }

  /**
   * Delete restaurant (admin)
   */
  async deleteRestaurant(id: string): Promise<void> {
    const result = await Restaurant.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Restaurant with ID '${id}' not found`);
    }
    // Also remove menu items for this restaurant
    await MenuItem.deleteMany({ restaurantId: id }).exec();
  }

  /**
   * Add a menu item to a restaurant
   */
  async createMenuItem(data: Partial<IMenuItem>): Promise<IMenuItemDocument> {
    const menuItem = new MenuItem(data);
    return menuItem.save();
  }

  /**
   * Update a menu item
   */
  async updateMenuItem(
    id: string,
    data: Partial<IMenuItem>
  ): Promise<IMenuItemDocument> {
    const item = await MenuItem.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();

    if (!item) {
      throw new NotFoundException(`Menu item with ID '${id}' not found`);
    }
    return item;
  }

  /**
   * Delete a menu item
   */
  async deleteMenuItem(id: string): Promise<void> {
    const result = await MenuItem.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Menu item with ID '${id}' not found`);
    }
  }
}

export const restaurantService = new RestaurantService();
