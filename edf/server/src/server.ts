import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { requestLogger } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import sequelize from "./config/database.js";
import User from "./models/User.js";
import { swaggerSpec } from "./config/swagger.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(requestLogger);
app.use(express.static("public"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(authRoutes);
app.use(userRoutes);

app.get("/", (_req, res) => {
  res.send("Bienvenue sur mon serveur");
});

app.use(errorHandler);

async function seedInitialUsers() {
  const count = await User.count();

  if (count > 0) {
    return;
  }

  await User.bulkCreate([
    { nom: "Dupont", prenom: "Jean", role: "student", isActive: true },
    { nom: "Martin", prenom: "Sophie", role: "student", isActive: false },
    { nom: "Durand", prenom: "Claire", role: "teacher", isActive: true },
  ]);

  console.log("Utilisateurs de démonstration insérés en base.");
}

try {
  await sequelize.authenticate();
  
  // Créer les tables s'il n'existent pas
  await sequelize.sync();
  
  await seedInitialUsers();

  app.listen(port, () => {
    console.log(`Serveur en écoute sur le port ${port}`);
  });
} catch (err) {
  console.error("Erreur de connexion à la base de données:", err);
  process.exitCode = 1;
}
