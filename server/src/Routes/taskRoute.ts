import express from "express";
import {
  createTask,
  deleteTask,
  getAllTasks,
  updateTask,
} from "../controllers/taskController";
import { authMiddleware } from "../middleware/auth";

export const router = express.Router();

router.get("/get-all", authMiddleware, getAllTasks);

router.post("/new", authMiddleware, createTask);

router.post("/update", authMiddleware, updateTask);

router.get("/delete", authMiddleware, deleteTask);
