import { Category, ICategory, ICategoryDocument } from "../models/category.model";
import { NotFoundException } from "../utils/app-error";

export class CategoryService {
  /**
   * Get all active categories ordered by displayOrder
   */
  async getCategories(onlyActive = true): Promise<ICategoryDocument[]> {
    const filter = onlyActive ? { isActive: true } : {};
    return Category.find(filter).sort({ displayOrder: 1, name: 1 }).exec();
  }

  /**
   * Find category by MongoDB ID
   */
  async getCategoryById(id: string): Promise<ICategoryDocument> {
    const category = await Category.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }
    return category;
  }

  /**
   * Find category by URL slug
   */
  async getCategoryBySlug(slug: string): Promise<ICategoryDocument> {
    const category = await Category.findOne({ slug: slug.toLowerCase() }).exec();
    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }
    return category;
  }

  /**
   * Create a new category
   */
  async createCategory(data: Partial<ICategory>): Promise<ICategoryDocument> {
    const category = new Category(data);
    return category.save();
  }

  /**
   * Update category by ID
   */
  async updateCategory(
    id: string,
    data: Partial<ICategory>,
  ): Promise<ICategoryDocument> {
    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).exec();

    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    return category;
  }

  /**
   * Delete category by ID
   */
  async deleteCategory(id: string): Promise<void> {
    const result = await Category.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }
  }
}

export const categoryService = new CategoryService();
