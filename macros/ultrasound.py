# coding: utf-8

import webiopi
import RPi.GPIO as GPIO
import random
import time

GPIO.setmode(GPIO.BCM)

@webiopi.macro
def init_ultrasound_gpio(trig_pin, echo_pin):
    GPIO.setup(int(trig_pin), GPIO.OUT)
    GPIO.setup(int(echo_pin), GPIO.IN)

# FOR DEBUG
# @webiopi.macro
# def get_direction_to_move():
#     return random.choice(["forward", "right", "left", "backward"])

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

    return distances[-1]

@webiopi.macro
def can_move_to(dis_to_dir):
    if dis_to_dir > 30.0:
        return True
    else:
        return False

@webiopi.macro
def get_turnable_direction(dis_r, dis_l):
    can_move_to_r = can_move_to(dis_r)
    can_move_to_l = can_move_to(dis_l)
    if can_move_to_r and can_move_to_l:
        return random.choice(["right", "left"])
    elif can_move_to_r and not can_move_to_l:
        return "right"
    elif not can_move_to_r and can_move_to_l:
        return "left"
    else:
        return "backward"

@webiopi.macro
def get_direction_to_move(t_f, e_f, t_r, e_r, t_l, e_l, t_b, e_b):
    dis_f = get_distance(t_f, e_f)
    dis_r = get_distance(t_r, e_r)
    dis_l = get_distance(t_l, e_l)
    dis_b = get_distance(t_b, e_b)

    if dis_f > 30.0:
        return "forward"
    elif dis_f > 10.0:
        return get_turnable_direction(dis_r, dis_l)
    elif dis_f > 0:
        return "backward"
    else:
        return "forward"
