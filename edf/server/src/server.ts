import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import bcrypt from "bcrypt";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import ledRoutes from "./routes/ledRoutes.js";
import thresholdRoutes from "./routes/thresholdRoutes.js";
import { requestLogger } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import sequelize from "./config/database.js";
import User from "./models/User.js";
import { swaggerSpec } from "./config/swagger.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

// ============================================
// CONFIGURATION CORS (frontend Vite)
// ============================================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(express.static("public"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(authRoutes);
app.use(ledRoutes);
app.use(thresholdRoutes);
app.use(userRoutes);

app.get("/", (_req, res) => {
  res.send("Bienvenue sur mon serveur");
});

app.use(errorHandler);

// ============================================
// Seed démo (schéma PostgreSQL users)
// ============================================
async function seedInitialUsers() {
  try {
    const count = await User.count();

    if (count > 0) {
      console.log("Des utilisateurs existent déjà, pas de seeding.");
      return;
    }

    const password_hash = await bcrypt.hash("password123", 10);
    await User.create({
      email: "seed.demo@edf.local",
      password_hash,
    });

    console.log("Utilisateur de démonstration inséré (seed.demo@edf.local / password123).");
  } catch (err) {
    console.warn(
      "Seed utilisateurs ignoré (schéma ou contraintes PostgreSQL).",
      err instanceof Error ? err.message : err,
    );
  }
}

// ============================================
// Démarrage
// ============================================
try {
  await sequelize.authenticate();
  console.log("Connexion à la base de données réussie.");

  await sequelize.sync();

  await seedInitialUsers();

  app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
  });
} catch (err) {
  console.error("Erreur de connexion à la base de données:", err);
  process.exit(1);
}
