import { Sequelize } from "sequelize";

/**
 * DatabaseConnection - Singleton Pattern
 * Garantit qu'il n'existe qu'une seule instance de connexion Sequelize
 * dans toute l'application
 */
class DatabaseConnection {
  private static instance: Sequelize | null = null;

  /**
   * Constructeur privé pour empêcher l'instanciation directe
   * Le Singleton ne peut être créé que via getInstance()
   */
  private constructor() {}

  /**
   * Récupère l'instance unique de la connexion Sequelize
   * Si elle n'existe pas encore, elle est créée
   */
  public static getInstance(): Sequelize {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = DatabaseConnection.createConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Crée la connexion Sequelize selon les variables d'environnement
   */
  private static createConnection(): Sequelize {
    if (process.env.DATABASE_URL) {
      return new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
          ssl: false,
        },
        logging: false,
      });
    }

    return new Sequelize({
      username: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "postgres",
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      dialect: "postgres",
      dialectOptions: {
        ssl: false,
      },
      logging: false,
    });
  }
}

// Export l'instance unique
const sequelize = DatabaseConnection.getInstance();

export { DatabaseConnection };
export default sequelize;
