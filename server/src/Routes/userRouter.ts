import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ error: "No token provided, authorization denied" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };

    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: "All fields a required" });
    return;
  }

  if (!isValidEmail(email.toString().trim())) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  if (name.toString().trim().length === 0) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  if (password.length < 8) {
    res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
    return;
  }

  try {
    const userRepo = AppDataSource.getRepository(User);
    const existingUser = await userRepo.findOne({ where: { email } });

    if (existingUser) { 
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepo.create({
      email: email.trim(),
      password: hashedPassword,
      name: name.trim(),
    });

    await userRepo.save(newUser);
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json();
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });

  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(400).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  console.log(`user ${user.id} logged in`);

  res.json({ message: "Login successful", user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  console.log(`user logged out`);

  res.json({ message: "Logged out" });
});

router.get("/me", authMiddleware, async (req, res) => {
  const userRepo = AppDataSource.getRepository(User);

  try {
    const user = await userRepo.findOne({
      where: { id: (req as any).user.userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json("Some error occured :(");
  }
});


