import express from "express";

import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/auth";

export const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/me", authMiddleware, getMe);
