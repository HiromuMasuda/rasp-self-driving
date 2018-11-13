# coding: utf-8

import RPi.GPIO as GPIO
import time
import sys

MOTOR_L1 = 26;
MOTOR_L2 = 19;
MOTOR_R1 = 13;
MOTOR_R2 = 6;

GPIO.setmode(GPIO.BCM)
for io in [MOTOR_L1, MOTOR_L2, MOTOR_R1, MOTOR_R2]:
    GPIO.setup(io, GPIO.OUT, initial=GPIO.LOW)

def left_cw():
    GPIO.output(MOTOR_L1, GPIO.HIGH)
    GPIO.output(MOTOR_L2, GPIO.LOW)

def left_ccw():
    GPIO.output(MOTOR_L1, GPIO.LOW)
    GPIO.output(MOTOR_L2, GPIO.HIGH)

def right_cw():
    GPIO.output(MOTOR_R1, GPIO.HIGH)
    GPIO.output(MOTOR_R2, GPIO.LOW)

def right_ccw():
    GPIO.output(MOTOR_R1, GPIO.LOW)
    GPIO.output(MOTOR_R2, GPIO.HIGH)

try:
    direction = sys.argv[1]
except IndexError:
    print("Please add the direction to move as a argument.")

if direction == "forward":
    left_cw()
    right_cw()
elif direction == "right":
    left_cw()
    right_ccw()
elif direction == "left":
    left_ccw()
    right_cw()
elif direction == "backward":
    left_ccw()
    right_ccw()
else:
    print("Direction must be forward/right/left/backword.")

time.sleep(0.5)

# stop
GPIO.output(MOTOR_L1, GPIO.LOW)
GPIO.output(MOTOR_L2, GPIO.LOW)
GPIO.output(MOTOR_R1, GPIO.LOW)
GPIO.output(MOTOR_R2, GPIO.LOW)

GPIO.cleanup()
