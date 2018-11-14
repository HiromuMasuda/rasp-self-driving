# coding: utf-8

import webiopi
import random
import RPi.GPIO as GPIO

@webiopi.macro
def direction_to_move():
    return random.choice(["forward", "right", "left", "backward"])
