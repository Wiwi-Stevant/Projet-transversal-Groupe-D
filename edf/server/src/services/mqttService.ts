import mqtt from "mqtt";
import Event from "../models/events.js";

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

    client.subscribe("sensors/data", (err: Error | null) => {
      if (err) {
        console.error("❌ Erreur d'abonnement:", err);
      }
    });
  });

  client.on("message", async (topic: string, message: Buffer) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📩 Message reçu sur ${topic}:`, data);

      // Enregistrement dans la table 'events'
      await Event.create({
        type: data.type,
        value: data.value,
        device_id: data.device_id
      });

      console.log("💾 Événement enregistré en base de données.");
    } catch (error) {
      console.error("❌ Erreur lors de la lecture du message MQTT:", error);
    }
  });

  client.on("error", (err: Error) => {
    console.error("❌ Erreur de connexion MQTT:", err);
  });
};