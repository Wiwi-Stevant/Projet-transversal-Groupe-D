import { type Request, type Response } from "express";
import sequelize from "../config/database.js";

/**
 * GET /api/events - Liste des événements avec pagination
 */
export const getEventsHandler = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const [results] = await sequelize.query(
      `SELECT id, type, created_at FROM events ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      { bind: [limit, offset] }
    );

    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as total FROM events`
    );

    const total = parseInt((countResult as any)[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      events: results,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des événements:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};