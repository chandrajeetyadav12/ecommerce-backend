import express from "express";

import {
  createCategory,
  getCategories,
} from "../controllers/category.controller";

import { protect } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";

const router =
  express.Router();

router.post(
  "/",
  protect,
  isAdmin,
  createCategory
);

router.get(
  "/",
  getCategories
);

export default router;