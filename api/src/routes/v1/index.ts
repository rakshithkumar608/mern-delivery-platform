import { Router } from "express";

import { addressRoutes } from "./user-address.route";
import { authRoutes } from "./auth.route";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/addresses", addressRoutes);
