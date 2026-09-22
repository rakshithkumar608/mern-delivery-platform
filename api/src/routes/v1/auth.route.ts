import { Router } from "express";

import { authController } from "../../controllers/auth.controller";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(authController.register));
authRoutes.post("/login", asyncHandler(authController.login));
authRoutes.post("/logout", asyncHandler(authController.logout));
authRoutes.get("/me", requireAuth, asyncHandler(authController.getMe));
