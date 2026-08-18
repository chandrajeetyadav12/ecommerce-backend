import express from "express";

import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
//   getAllOrders,
//   updateOrderStatus,
} from "../controllers/order.controller";

import { protect } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";

const router = express.Router();

router.post(
  "/place",
  protect,
  placeOrder
);

router.get(
  "/my-orders",
  protect,
  getMyOrders
);

router.get(
  "/admin/all",
  protect,
  isAdmin,
  getAllOrders
);

router.put(
  "/admin/:id",
  protect,
  isAdmin,
  updateOrderStatus
);

export default router;