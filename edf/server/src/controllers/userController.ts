import type { Request, Response } from "express";
import { UserService } from "../services/userService.js";

const userService = new UserService();

/**
 * GET /api/users
 */
export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await userService.findAll();
  res.status(200).json(users);
};

/**
 * GET /api/users/active
 */
export const getActiveUsers = async (_req: Request, res: Response) => {
  const users = await userService.findActive();
  res.status(200).json(users);
};
