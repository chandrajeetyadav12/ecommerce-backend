import express from "express";

import {
  register,
  login,
  getProfile,
  logout,
} from "../controllers/auth.controller";

import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);
router.get(
  "/profile",
  protect,
  getProfile
);

export default router;