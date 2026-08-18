import express from "express";

import {
  createAddress,
  getAddresses,
} from "../controllers/address.controller";

import {
  protect,
} from "../middlewares/auth.middleware";

const router =
  express.Router();

router.post(
  "/",
  protect,
  createAddress
);

router.get(
  "/",
  protect,
  getAddresses
);

export default router;