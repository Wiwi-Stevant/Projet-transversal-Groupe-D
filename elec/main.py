from machine import Pin
from umqtt.simple import MQTTClient
import network
import utime

# =========================
# CONFIGURATION MQTT
# =========================

MQTT_BROKER = "broker.hivemq.com"

# Le CLIENT_ID doit être unique
CLIENT_ID = "PicoW_Compteur_Click_123456"

# Topic MQTT
TOPIC_CLICK = b"pico/compteur/click"

# Variables globales
global wlan, client, led, bouton, compteur

SSID = "iPhone de William"
PWD = "..."

# =========================
# CONNEXION WIFI
# =========================

def connect_wifi():
    global wlan

    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(SSID, PWD)

    print("Connexion au WiFi...")

    while not wlan.isconnected():
        print("En attente de connexion...")
        utime.sleep(1)

    print("Connecté avec l'IP :", wlan.ifconfig()[0])


# =========================
# CONNEXION MQTT
# =========================

def connect_mqtt():
    global client

    client = MQTTClient(CLIENT_ID, MQTT_BROKER)
    client.connect()

    print("Connecté au Broker MQTT")


# =========================
# INITIALISATION
# =========================

def init():
    global led, bouton, compteur

    # WiFi + MQTT
    connect_wifi()
    connect_mqtt()

    # GPIO
    led = Pin(2, Pin.OUT)
    bouton = Pin(0, Pin.IN, Pin.PULL_UP)

    compteur = 0

    print("Système prêt")


# =========================
# ENVOI MQTT
# =========================

def send_click():
    global compteur, client

    compteur += 1

    # Heure actuelle
    temps = utime.localtime()

    date_heure = "{:02d}/{:02d}/{:02d} {:02d}:{:02d}:{:02d}".format(
        temps[2], temps[1], temps[0],
        temps[3], temps[4], temps[5]
    )

    # Message à envoyer
    message = '{{"count": {}, "time": "{}"}}'.format(
        compteur,
        date_heure
    )

    print("----------------")
    print("Bouton appuyé")
    print("Compteur :", compteur)
    print("Heure :", date_heure)

    try:
        client.publish(TOPIC_CLICK, message)
        print("Donnée publiée sur MQTT :", message)

    except Exception as e:
        print("Erreur MQTT, tentative de reconnexion...", e)

        try:
            client.connect()
            client.publish(TOPIC_CLICK, message)

        except:
            print("Échec de reconnexion MQTT")


# =========================
# BOUCLE PRINCIPALE
# =========================

def mainloop():
    global bouton, led

    while True:

        # Si bouton appuyé
        if bouton.value() == 0:

            led.value(1)

            send_click()

            # Anti-rebond
            utime.sleep(0.3)

            # Attendre relâchement
            while bouton.value() == 0:
                pass

            led.value(0)

        utime.sleep(0.01)


# =========================
# LANCEMENT
# =========================

init()
mainloop()
