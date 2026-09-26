import { Router } from "express";

import { addressRoutes } from "./user-address.route";
import { authRoutes } from "./auth.route";
import { categoryRoutes } from "./category.route";
import { dishRoutes } from "./dish.route";
import { restaurantRoutes } from "./restaurant.route";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/addresses", addressRoutes);
routes.use("/categories", categoryRoutes);
routes.use("/dishes", dishRoutes);
routes.use("/restaurants", restaurantRoutes);

