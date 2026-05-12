import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import sequelize from "../config/database.js";

// On définit les rôles possibles si besoin
export type UserRole = "student" | "teacher" | "admin";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  // On déclare les nouveaux champs pour TypeScript
  declare email: string;
  declare password_hash: string;
  declare role: CreationOptional<UserRole>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // L'email doit être unique
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "student",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users", // Doit correspondre au nom dans db.sql
    timestamps: true,   // Active createdAt et updatedAt (présents dans ton SQL)
    underscored: true,  // Important car ton SQL utilise password_hash (snake_case)
  }
);

export default User;