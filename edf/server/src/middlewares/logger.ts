import type { Request, Response, NextFunction } from "express";

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
};

