import { Sequelize } from "sequelize";
import "dotenv/config"; // S'assure que les variables du .env sont chargées

/**
 * DatabaseConnection - Singleton Pattern
 * Garantit qu'il n'existe qu'une seule instance de connexion Sequelize
 */
class DatabaseConnection {
  private static instance: Sequelize | null = null;

  private constructor() {}

  /**
   * Récupère l'instance unique de la connexion Sequelize
   */
  public static getInstance(): Sequelize {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = DatabaseConnection.createConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Crée la connexion Sequelize
   * Priorité aux variables détaillées pour le développement local
   */
  private static createConnection(): Sequelize {
    // Si DATABASE_URL est présent ET qu'on n'est pas en local (ex: sur Render ou Railway)
    if (process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
      console.log("Démarrage de la connexion via DATABASE_URL...");
      return new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false, // Nécessaire pour beaucoup de services Cloud
          },
        },
        logging: false,
      });
    }

    // Sinon, on utilise les variables détaillées (Configuration par défaut pour ton PC)
    console.log(`Tentative de connexion locale à la base : ${process.env.DB_NAME || "edf_project"}`);
    
    return new Sequelize({
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "edf_project",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      dialect: "postgres",
      logging: false,
      // On désactive le SSL en local pour éviter les erreurs de certificat
      dialectOptions: {
        ssl: false,
      },
    });
  }
}

// Export l'instance unique
const sequelize = DatabaseConnection.getInstance();

export { DatabaseConnection };
export default sequelize;