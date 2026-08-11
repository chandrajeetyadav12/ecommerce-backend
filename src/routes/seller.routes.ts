import express from "express";

import {
  createSellerProfile,
  getMySellerProfile,
  getPendingSellers,
  approveSeller,
  rejectSeller,
} from "../controllers/seller.controller";

import {
  protect,
} from "../middlewares/auth.middleware";

import {
  isAdmin,
} from "../middlewares/role.middleware";
import upload from "../middlewares/upload.middleware";
const router =
  express.Router();

router.post(
  "/register",
  protect,
    upload.fields([
    { name: "panCard", maxCount: 1 },
    { name: "aadhaarCard", maxCount: 1 },
    { name: "gstCertificate", maxCount: 1 },
  ]),
  createSellerProfile
);

router.get(
  "/profile",
  protect,
  getMySellerProfile
);

router.get(
  "/pending",
  protect,
  isAdmin,
  getPendingSellers
);

router.put(
  "/approve/:sellerId",
  protect,
  isAdmin,
  approveSeller
);

router.put(
  "/reject/:sellerId",
  protect,
  isAdmin,
  rejectSeller
);

export default router;