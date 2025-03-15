import express, { Request, Response, NextFunction } from "express";
import { authMiddleware } from "./userRouter";
import { AppDataSource } from "../data-source";
import { Task } from "../entities/Task";
import { User } from "../entities/User";
import { InsertValuesMissingError } from "typeorm";

export const router = express.Router();

router.get("/get-all", authMiddleware, async (req, res) => {
  const taskRepo = AppDataSource.getRepository(Task);

  try {
    const tasks = await taskRepo.find({
      where: { user: { id: (req as any).user.userId } },
    });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json("Some error occured :(");
  }
});

router.post("/update", authMiddleware, async (req, res) => {
  const { id, title, description, status } = req.body;

  const taskRepo = AppDataSource.getRepository(Task);

  if (!id || !title || !description || !status) {
    res.status(400).json("All fields required");
    console.error("All fields required");
    return;
  }

  if (title.trim().length === 0 || description.trim().length === 0) {
    res.status(400).json("All fields should have at least 1 character");
    console.error("All fields should have at least 1 character");
    return;
  }

  try {
    const task = await taskRepo.findOne({
      where: { id },
      relations: ["user"],
    });

    if (task?.user.id !== (req as any).user.userId) {
      res.status(403).json();
      console.error("Forbidden to update");
      return;
    }

    await taskRepo.update(id, {
      title: title.trim(),
      description: description.trim(),
      status: status.trim(),
    });

    res.json({ message: "Task successfully updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json("Some error occured :(");
  }
});

router.get("/delete", authMiddleware, async (req, res) => {
  const taskRepo = AppDataSource.getRepository(Task);

  try {
    const taskId = parseInt(req.query.id as string, 10);

    const task = await taskRepo.findOne({
      where: { id: taskId },
      relations: ["user"],
    });

    if (task?.user.id !== (req as any).user.userId) {
      res.status(403).json();
      return;
    }

    await taskRepo.delete(taskId);

    res.json({ message: "Task deleted updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json("Some error occured :(");
  }
});

router.post("/new", authMiddleware, async (req, res) => {
  const { title, description, status } = req.body;

  const taskRepo = AppDataSource.getRepository(Task);
  const userRepo = AppDataSource.getRepository(User);

  if (!title || !description || !status) {
    res.status(400).json("All fields required");
    console.error("All fields required");
    return;
  }

  if (title.trim().length === 0 || description.trim().length === 0) {
    res.status(400).json("All fields should have at least 1 character");
    console.error("All fields should have at least 1 character");
    return;
  }

  try {
    const user = await userRepo.findOne({
      where: { id: (req as any).user.userId },
    });

    const newTask = taskRepo.create({
      title: title.trim(),
      description: description.trim(),
      status: status.trim(),
      user: user as User,
    });

    await taskRepo.save(newTask);
    res.json({ message: "Task successfully created", newTask });
  } catch (err) {
    console.error(err);
    res.status(500).json("Some error occured :(");
  }
});
