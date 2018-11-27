# coding: utf-8

import webiopi
import RPi.GPIO as GPIO
import random
import time
import json

GPIO.setmode(GPIO.BCM)

@webiopi.macro
def init_ultrasound_gpio(trig_pin, echo_pin):
    GPIO.setup(int(trig_pin), GPIO.OUT)
    GPIO.setup(int(echo_pin), GPIO.IN)

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
        distances.append(round(distance, 2))

    return distances[-1]

@webiopi.macro
def can_move_to(dis_to_dir):
    if dis_to_dir > 40.0:
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
def get_direction_to_move(dis_f, dis_r, dis_l, dis_b):
    if dis_f > 40.0:
        return "forward"
    elif dis_f > 20.0:
        return get_turnable_direction(dis_r, dis_l)
    elif dis_f > 0:
        if dis_b > 40.0:
            return "backward"
        elif dis_b > 20.0:
            return get_turnable_direction(dis_r, dis_l)
        else:
            return "forward"
    else:
        return "backward"

@webiopi.macro
def get_direction(t_f, e_f, t_r, e_r, t_l, e_l, t_b, e_b):
    dis_f = get_distance(t_f, e_f)
    dis_r = get_distance(t_r, e_r)
    dis_l = get_distance(t_l, e_l)
    dis_b = get_distance(t_b, e_b)

    direction = get_direction_to_move(dis_f, dis_r, dis_l, dis_b)

    context = {
        "direction": direction,
        "distances": {
            "forward":  dis_f,
            "right":    dis_r,
            "left":     dis_l,
            "backward": dis_b,
        }
    }
    return json.dumps(context)
