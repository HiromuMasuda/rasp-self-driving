# config: utf-8
import RPi.GPIO as GPIO
import time

INFRARED = 25

GPIO.setmode(GPIO.BCM)
GPIO.setup(INFRARED, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

try:
    while True:
        print(GPIO.input(INFRARED))
        time.sleep(1)
except KeyboardInterrupt:
    pass

GPIO.cleanup()
