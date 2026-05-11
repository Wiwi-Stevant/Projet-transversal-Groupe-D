from machine import Pin
import utime
from umqtt.simple import MQTTClient

# MQTT

SSID = "iPhone de William"
PASSWORD = ""

MQTT_BROKER = "192.168.1.100"
CLIENT_ID = "Pico"
TOPIC_CLICK = b"compteur/click"

# ========================
# WIFI
# ========================

import network

wifi = network.WLAN(network.STA_IF)
wifi.active(True)
wifi.connect(SSID, PASSWORD)

print("Connexion au WiFi...")

while not wifi.isconnected():
    utime.sleep(1)
    print("Connexion en cours...")

print("WiFi connecté")
print("IP :", wifi.ifconfig()[0])

# ========================
# MQTT
# ========================

client = MQTTClient(CLIENT_ID, MQTT_BROKER)
client.connect()

print("Connecté au broker MQTT")

# ========================
# GPIO
# ========================

led = Pin(2, Pin.OUT)
bouton = Pin(0, Pin.IN, Pin.PULL_UP)

compteur = 0

print("Système prêt")

# ========================
# BOUCLE PRINCIPALE
# ========================

while True:

    # Si bouton appuyé
    if bouton.value() == 0:

        compteur += 1
        temps = utime.localtime()

        led.value(1)

        # Format heure
        date_heure = "{:02d}/{:02d}/{:02d} {:02d}:{:02d}:{:02d}".format(
            temps[2], temps[1], temps[0],
            temps[3], temps[4], temps[5]
        )

        # Message MQTT
        message = '{{"count": {}, "time": "{}"}}'.format(
            compteur,
            date_heure
        )

        print("----------------")
        print("Bouton appuyé")
        print("Compteur :", compteur)
        print("Heure :", date_heure)
        print("MQTT envoyé :", message)

        # Envoi MQTT
        client.publish(TOPIC_CLICK, message)

        # Anti-rebond
        utime.sleep(0.3)

        # Attendre relâchement
        while bouton.value() == 0:
            pass

        led.value(0)

    utime.sleep(0.01)
