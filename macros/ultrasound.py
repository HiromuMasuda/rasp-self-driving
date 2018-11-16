# coding: utf-8

import webiopi
import RPi.GPIO as GPIO
import random
import time

# TRIGとECHOのGPIO番号
# TRIG_PIN = 14
# ECHO_PIN = 15

GPIO.setmode(GPIO.BCM)

@webiopi.macro
def init_ultrasound_gpio(trig_pin, echo_pin):
    GPIO.setup(int(trig_pin), GPIO.OUT)
    GPIO.setup(int(echo_pin), GPIO.IN)

@webiopi.macro
def get_direction_to_move():
    return random.choice(["forward", "right", "left", "backward"])

@webiopi.macro
def get_distance(trig_pin, echo_pin):
    TRIG_PIN = int(trig_pin)
    ECHO_PIN = int(echo_pin)
    num = 1
    v = 33150 + 60*24
    distances = []

    for i in range(num):
        # TRIGピンを0.3[s]だけLOW
        GPIO.output(TRIG_PIN, GPIO.LOW)
        time.sleep(0.3)

        # TRIGピンを0.00001[s]だけ出力(超音波発射)
        GPIO.output(TRIG_PIN, True)
        time.sleep(0.00001)
        GPIO.output(TRIG_PIN, False)

        # HIGHの時間計測
        # t = pulseIn(ECHO_PIN)
        start = 1
        end = 0
        t_start = 0
        t_end = 0
        while GPIO.input(ECHO_PIN) == end:
            t_start = time.time()
        while GPIO.input(ECHO_PIN) == start:
            t_end = time.time()
        t = t_end - t_start

        # 距離[cm] = 音速[cm/s] * 時間[s]/2
        distance = v * t/2
        distances.append(distance)

    GPIO.cleanup()
    return distances[-1]
