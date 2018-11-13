# coding: utf-8

import RPi.GPIO as GPIO
import time

MOTOR_B1 = 13;
MOTOR_B2 = 6;
ios = [MOTOR_B1, MOTOR_B2]

GPIO.setmode(GPIO.BCM)
for io in ios:
    GPIO.setup(io, GPIO.OUT, initial=GPIO.LOW)

# move forward
GPIO.output(MOTOR_B1, GPIO.HIGH)
GPIO.output(MOTOR_B2, GPIO.LOW)
time.sleep(1)

# stop
GPIO.output(MOTOR_B1, GPIO.LOW)
GPIO.output(MOTOR_B2, GPIO.LOW)

GPIO.cleanup()
