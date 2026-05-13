import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Event extends Model {
  declare id: number;
  declare type: string;
  declare value: string;
  declare device_id: string;
  declare createdAt: Date; // Ajoute la déclaration ici pour TS
}

Event.init({
  type: { type: DataTypes.STRING, allowNull: false },
  value: { type: DataTypes.STRING, allowNull: false },
  device_id: { type: DataTypes.STRING, allowNull: false }
}, {
  sequelize,
  modelName: "Event",
  tableName: "events",
  underscored: false // <--- On remet à FALSE car on utilise le CamelCase partout
});

export default Event;