import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { isValidEmail } from "../utils";

export const registerUser = async (req: Request, res: Response) => {
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
};

export const loginUser = async (req: Request, res: Response) => {
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
};

export const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie("token");
  console.log(`user logged out`);

  res.json({ message: "Logged out" });
};

export const getMe = async (req: Request, res: Response) => {
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
};
