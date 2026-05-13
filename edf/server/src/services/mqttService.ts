import mqtt from "mqtt";
import Event from "../models/events.js";
import { Op } from "sequelize";

// On construit l'URL de connexion
// En local sur ton PC : ce sera mqtt://127.0.0.1:1883
// Sur le serveur admin : ce sera mqtt://mosquitto:1883
const mqttHost = process.env.MQTT_HOST || "127.0.0.1";
const mqttPort = process.env.MQTT_PORT || "1883";
const mqttUrl = `mqtt://${mqttHost}:${mqttPort}`;

const mqttOptions: mqtt.IClientOptions = {
  username: process.env.MQTT_USERNAME || "",
  password: process.env.MQTT_PASSWORD || "",
  reconnectPeriod: 5000,
};

export const initMqtt = () => {
  // On passe l'URL en premier argument, puis les options (user/pass)
  const client = mqtt.connect(mqttUrl, mqttOptions);

  client.on("connect", () => {
    console.log(`🚀 Backend connecté au Broker sur ${mqttUrl}`);
    
    client.subscribe("sensors/data", (err) => {
      if (err) console.error("❌ Erreur d'abonnement:", err);
    });
  });

  client.on("message", async (topic: string, message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📩 Message reçu sur ${topic}:`, data);

      // On utilise created_at (avec underscore) car c'est ce qu'on a vu dans ta DB
      await Event.create({
        type: data.type,
        value: data.value,
        device_id: data.device_id
      });

      if (data.type === "entree" || data.type === "mouvement") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await Event.count({
          where: {
            device_id: data.device_id,
            created_at: { // <--- Vérifie bien si c'est created_at ou createdAt ici
              [Op.gte]: today 
            }
          }
        });

        console.log(`📊 Total passages aujourd'hui pour ${data.device_id}: ${count}`);

        if (count >= 10) {
          console.log("⚠️ SEUIL ATTEINT : Envoi de l'ordre d'allumage LED");
          client.publish("sensors/led", "ON");
        }
      }
    } catch (error) {
      console.error("❌ Erreur lors du traitement MQTT:", error);
    }
  });

  client.on("error", (err) => {
    console.error(`❌ Erreur de connexion sur ${mqttUrl} :`, err.message);
  });
};