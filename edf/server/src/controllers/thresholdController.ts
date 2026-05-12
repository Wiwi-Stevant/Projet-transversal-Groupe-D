import type { Request, Response } from "express";
import { getThreshold, upsertThreshold } from "../services/thresholdService.js";

function parseThresholdBody(body: unknown): number | null {
  if (body === null || typeof body !== "object") {
    return null;
  }
  const raw = (body as { threshold?: unknown }).threshold;
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return null;
  }
  if (!Number.isInteger(raw)) {
    return null;
  }
  if (raw < 0) {
    return null;
  }
  return raw;
}

/**
 * GET /api/threshold — lit le seuil d’activité (`activity_threshold` dans `config`).
 */
export const getThresholdHandler = async (_req: Request, res: Response) => {
  const threshold = await getThreshold();

  if (threshold === null) {
    res.status(404).json({ error: "Seuil non configuré." });
    return;
  }

  res.status(200).json({ threshold });
};

/**
 * POST /api/threshold — définit le seuil (entier ≥ 0).
 */
export const setThresholdHandler = async (req: Request, res: Response) => {
  const value = parseThresholdBody(req.body);

  if (value === null) {
    res.status(400).json({
      error:
        'Le corps JSON doit contenir un entier "threshold" (nombre fini, ≥ 0).',
    });
    return;
  }

  const payload = await upsertThreshold(value);
  res.status(200).json(payload);
};
