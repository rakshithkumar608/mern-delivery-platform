import { Request, Response } from "express";
import { HttpStatus } from "../config/http-status.config";
import { categoryService } from "../services/category.service";
import { BadRequestException } from "../utils/app-error";

export class CategoryController {
  getCategories = async (_req: Request, res: Response): Promise<void> => {
    const categories = await categoryService.getCategories();
    res.status(HttpStatus.OK).json({
      success: true,
      count: categories.length,
      categories,
    });
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id || typeof id !== "string") {
      throw new BadRequestException("Category ID parameter is required");
    }
    const category = await categoryService.getCategoryById(id);
    res.status(HttpStatus.OK).json({
      success: true,
      category,
    });
  };

  getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    if (!slug || typeof slug !== "string") {
      throw new BadRequestException("Category slug parameter is required");
    }
    const category = await categoryService.getCategoryBySlug(slug);
    res.status(HttpStatus.OK).json({
      success: true,
      category,
    });
  };
}

export const categoryController = new CategoryController();
