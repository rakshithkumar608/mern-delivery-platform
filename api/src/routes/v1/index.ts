import { Router } from "express";

import { addressRoutes } from "./user-address.route";
import { authRoutes } from "./auth.route";
import { basketRoutes } from "./basket.route";
import { categoryRoutes } from "./category.route";
import { dishRoutes } from "./dish.route";
import { orderRoutes } from "./order.route";
import { paymentRoutes } from "./payment.route";
import { restaurantRoutes } from "./restaurant.route";
import { searchRoutes } from "./search.route";
import { deliveryRuleRoutes } from "./delivery-rule.route";

export const  routes =  Router();  

routes.use("/auth", authRoutes);
routes.use("/addresses", addressRoutes);
routes.use("/basket", basketRoutes);
routes.use("/categories", categoryRoutes);
routes.use("/dishes", dishRoutes);
routes.use("/orders", orderRoutes);
routes.use("/payments", paymentRoutes);
routes.use("/restaurants", restaurantRoutes);
routes.use("/search", searchRoutes);
routes.use("/delivery-rules", deliveryRuleRoutes);
routes.use("/settings/delivery", deliveryRuleRoutes);




