import mqtt from "mqtt";
import Event from "../models/events.js";
import { Op } from "sequelize"; // Import nécessaire pour filtrer par date

const mqttOptions = {
  host: process.env.MQTT_HOST || "localhost",
  port: Number(process.env.MQTT_PORT || 1883),
  username: process.env.MQTT_USERNAME || "useredf",
  password: process.env.MQTT_PASSWORD || "123456789",
};

export const initMqtt = () => {
  const client = mqtt.connect(mqttOptions);

  client.on("connect", () => {
    console.log("🚀 Backend connecté au Docker Mosquitto !");
    // On s'abonne aux données des capteurs
    client.subscribe("sensors/data", (err) => {
      if (err) console.error("❌ Erreur d'abonnement:", err);
    });
  });

  client.on("message", async (topic: string, message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📩 Message reçu sur ${topic}:`, data);

      // 1. Enregistrement en base de données
      await Event.create({
        type: data.type,
        value: data.value,
        device_id: data.device_id
      });
      console.log("💾 Événement enregistré.");

      // 2. Logique du Callback (Compteur de passages)
      if (data.type === "entree" || data.type === "mouvement") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // On compte combien d'événements pour cet appareil aujourd'hui
        const count = await Event.count({
          where: {
            device_id: data.device_id,
            createdAt: {
              [Op.gte]: today // Supérieur ou égal à aujourd'hui 00:00
            }
          }
        });

        console.log(`📊 Total passages aujourd'hui pour ${data.device_id}: ${count}`);

        // 3. Envoi de l'ordre à la Raspberry si le seuil est atteint
        if (count >= 50) {
          console.log("⚠️ SEUIL ATTEINT : Envoi de l'ordre d'allumage LED");
          client.publish("sensors/led", "ON");
        }
      }

    } catch (error) {
      console.error("❌ Erreur lors du traitement MQTT:", error);
    }
  });

  client.on("error", (err) => {
    console.error("❌ Erreur de connexion MQTT:", err);
  });
};