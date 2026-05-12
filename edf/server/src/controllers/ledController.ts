import type { Request, Response } from "express";
import { upsertLedState } from "../services/ledService.js";

/**
 * POST /api/led — met à jour l'état LED dans `config` (`led_state` → on | off).
 */
export const setLed = async (req: Request, res: Response) => {
  if (typeof req.body?.on !== "boolean") {
    res.status(400).json({ error: 'Le corps JSON doit contenir un booléen "on".' });
    return;
  }

  const payload = await upsertLedState(req.body.on as boolean);
  res.status(200).json(payload);
};
