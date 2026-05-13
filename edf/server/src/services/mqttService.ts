import mqtt from "mqtt";
import Event from "../models/events.js";

const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://127.0.0.1:1883";

export const initMqtt = () => {
  const client = mqtt.connect(brokerUrl);

  client.on("connect", () => {
    console.log("✅ Connecté au Broker MQTT");
    
    // Abonnement au topic
    client.subscribe("sensors/data", (err) => {
      if (!err) {
        console.log("📡 Abonné au topic 'sensors/data'");
      } else {
        console.error("❌ Erreur d'abonnement:", err);
      }
    });
  });

  client.on("message", async (topic, message) => {
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

  client.on("error", (err) => {
    console.error("❌ Erreur de connexion MQTT:", err);
  });
};