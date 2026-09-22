import { Router } from "express";

import { userAddressController } from "../../controllers/user-address.controller";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware";
import { requireAuth } from "../../middlewares/auth.middleware";

export const addressRoutes = Router();

// All address routes require authentication
addressRoutes.use(requireAuth);

addressRoutes.post("/", asyncHandler(userAddressController.createAddress));
addressRoutes.get("/", asyncHandler(userAddressController.getMyAddresses));
addressRoutes.patch(
  "/:id/default",
  asyncHandler(userAddressController.setDefaultAddress),
);
addressRoutes.put("/:id", asyncHandler(userAddressController.updateAddress));
addressRoutes.delete("/:id", asyncHandler(userAddressController.deleteAddress));
