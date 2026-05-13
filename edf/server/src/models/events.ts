import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Event extends Model {
  // On utilise 'declare' pour éviter que TS n'écrase les champs de Sequelize
  declare id: number;
  declare type: string;
  declare value: string;
  declare device_id: string;
}

Event.init({
  type: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.STRING, allowNull: false },
  device_id: { type: DataTypes.STRING, allowNull: false }
}, {
  sequelize,
  modelName: "Event",
  tableName: "events", // On force le nom en minuscule pour pgAdmin
  underscored: true    // Utilise created_at au lieu de createdAt
});

export default Event;