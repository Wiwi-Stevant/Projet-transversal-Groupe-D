import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import bcrypt from "bcrypt"; // Importé pour le seed
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { requestLogger } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import sequelize from "./config/database.js";
import User from "./models/User.js";
import { swaggerSpec } from "./config/swagger.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

// ============================================
// CONFIGURATION CORS (Crucial pour le login)
// ============================================
app.use(cors({
  origin: "http://localhost:5173", // Ton port Frontend Vite
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use(express.static("public"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(authRoutes);
app.use(userRoutes);

app.get("/", (_req, res) => {
  res.send("Bienvenue sur mon serveur");
});

app.use(errorHandler);

// ============================================
// FONCTION DE SEED (Avec hachage dynamique)
// ============================================
async function seedInitialUsers() {
  const count = await User.count();

  if (count > 0) {
    console.log("Des utilisateurs existent déjà, pas de seeding.");
    return;
  }

  // On crée un hash frais pour "password123"
  const saltRounds = 10;
  const hashedPass = await bcrypt.hash("password123", saltRounds);

  await User.bulkCreate([
    { 
      email: "jean.dupont@test.com", 
      password_hash: hashedPass, 
      role: "student" 
    },
    { 
      email: "sophie.martin@test.com", 
      password_hash: hashedPass, 
      role: "student" 
    }
  ]);

  console.log("✅ Utilisateurs de démonstration insérés avec succès.");
}

// ============================================
// DEMARRAGE DU SERVEUR
// ============================================
try {
  await sequelize.authenticate();
  console.log("Connexion à la base de données réussie.");

  // Utilise { force: true } UNE SEULE FOIS pour réinitialiser si besoin, 
  // puis remet à { force: false } ou vide.
  await sequelize.sync();
  
  await seedInitialUsers();

  app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
  });
} catch (err) {
  console.error("Erreur de connexion à la base de données:", err);
  process.exit(1);
}