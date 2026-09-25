import { Router } from "express";
import { categoryController } from "../../controllers/category.controller";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";

export const categoryRoutes = Router();

// Public routes for fetching categories
categoryRoutes.get("/", asyncHandler(categoryController.getCategories));
categoryRoutes.get("/slug/:slug", asyncHandler(categoryController.getCategoryBySlug));
categoryRoutes.get("/:id", asyncHandler(categoryController.getCategoryById));
