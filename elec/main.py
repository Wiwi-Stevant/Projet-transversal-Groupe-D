from machine import Pin
from umqtt.simple import MQTTClient
import network
import utime

# Variable
global wlan, client, led, bouton, compteur

    # WiFi
SSID = "Tenda_962F10"
PWD = "123456789"

    # MQTT
MQTT_BROKER = "grp-d.ephec-ti.be"
CLIENT_ID = "PicoW_Compteur_Click_123456"
USER='useredf'
PASSWD='123456789'
TOPIC_CLICK = b"sensors/data"
TOPIC_LED = b"sensors/led"

# connection wifi
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

# connection MQTT
def connect_mqtt():
    global client
    client = MQTTClient(CLIENT_ID, MQTT_BROKER, port=1888, user=USER, password=PASSWD)
    client.connect()
    print("Connecté au Broker MQTT")
    client.set_callback(mqtt_callback)
    client.subscribe(TOPIC_LED)

def init():
    global led, bouton, compteur
    connect_wifi()
    connect_mqtt()

    led = Pin(2, Pin.OUT)
    bouton = Pin(0, Pin.IN, Pin.PULL_UP)
    compteur = 0
    print("Système prêt")

# envoie vers le broquer
def send_click():
    global compteur, client
    compteur += 1
    temps = utime.localtime()
    date_heure = "{:02d}/{:02d}/{:02d} {:02d}:{:02d}:{:02d}".format(
        temps[2], temps[1], temps[0],
        temps[3], temps[4], temps[5]
    )

# console
    print("----------------")
    print("Bouton appuyé")
    print("Compteur :", compteur)
    print("Heure :", date_heure)

    # envoye
    message = '{{"type": "entree", "value": {}, "device_id": "pico_w_001"}}'.format(compteur)
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

def mqtt_callback(topic, msg):
    global led

    message = msg.decode().strip().lower()

    print("Message reçu sur", topic.decode(), ":", message)

    if topic == TOPIC_LED:

        if message == "on":
            led.value(1)
            print("LED allumée à distance")

        elif message == "off":
            led.value(0)
            print("LED éteinte à distance")

        else:
            print("Commande inconnue : utiliser 'on' ou 'off'")

def mainloop():
    global bouton, led
    while True:
        client.check_msg()
        
        if bouton.value() == 0:
            led.value(1)
            send_click()

            # Anti-rebond
            utime.sleep(0.3)

            while bouton.value() == 0:
                utime.sleep(0.5)
                pass

            led.value(0)

init()
mainloop()
