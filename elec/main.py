from machine import Pin
import utime

# inititiation
led = Pin(2, Pin.OUT)
bouton = Pin(0, Pin.IN, Pin.PULL_UP)

compteur = 0

print("Ok")

while True:
    # si bouton appuier
    if bouton.value() == 0:

        compteur += 1

        # Heure
        temps = utime.localtime()
        led.value(1)

        print("----------------")
        print("Bouton appuier")
        print("Compteur :", compteur)

        print("Heure : {:02d}/{:02d}/{:02d} : {:02d}:{:02d}:{:02d}".format(
             temps[2], temps[1], temps[0], temps[3], temps[4], temps[5]
        ))
        
        # cooldown
        utime.sleep(0.3)

        # ne fait rien tant que le bouton n'est pas relacher
        while bouton.value() == 0:
            pass

        led.value(0)

    utime.sleep(0.01)
 