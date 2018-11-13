# coding: utf-8

import RPi.GPIO as GPIO
import time

MOTOR_A1 = 26;
MOTOR_A2 = 19;
ios = [MOTOR_A1, MOTOR_A2]

GPIO.setmode(GPIO.BCM)
for io in ios:
    GPIO.setup(io, GPIO.OUT, initial=GPIO.LOW)

# move forward
GPIO.output(MOTOR_A1, GPIO.HIGH)
GPIO.output(MOTOR_A2, GPIO.LOW)
time.sleep(5)

# stop
GPIO.output(MOTOR_A1, GPIO.LOW)
GPIO.output(MOTOR_A2, GPIO.LOW)

GPIO.cleanup()
