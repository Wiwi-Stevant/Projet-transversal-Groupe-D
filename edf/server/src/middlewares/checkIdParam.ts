import type { Request, Response, NextFunction } from "express";

export const checkIdParam = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const parsedId = Number(id);

  if (!id || Number.isNaN(parsedId) || !Number.isInteger(parsedId)) {
    res.status(400).json({ error: "Le paramètre 'id' doit être un entier valide." });
    return;
  }

  next();
};

