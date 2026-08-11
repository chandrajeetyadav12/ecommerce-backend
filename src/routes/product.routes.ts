import express from "express";

import {
    approveProduct,
  createProduct,
  deleteProduct,
  getMyProducts,
  getPendingProducts,
  getProductById,
  getProducts,
  rejectProduct,
  updateProduct,
} from "../controllers/product.controller";

import {
    protect,
} from "../middlewares/auth.middleware";

import {
    isSeller,
} from "../middlewares/seller.middleware";
import upload from "../middlewares/upload.middleware";
import { isAdmin } from "../middlewares/role.middleware";

const router =
  express.Router();

router.post(
  "/create",
  protect,
  isSeller,
  upload.single("image"),
  createProduct
);
router.get(
  "/pending",
  protect,
  isAdmin,
  getPendingProducts
);
router.get(
  "/my-products",
  protect,
  isSeller,
  getMyProducts
);

router.get(
  "/",
  getProducts
);

router.get(
  "/:id",
  getProductById
);

router.put(
  "/:id",
  protect,
  isSeller,
  upload.single("image"),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  isSeller,
  deleteProduct
);

router.put(
  "/approve/:id",
  protect,
  isAdmin,
  approveProduct
);

router.put(
  "/reject/:id",
  protect,
  isAdmin,
  rejectProduct
);


export default router;