# encoding: utf-8

import webiopi
import RPi.GPIO as GPIO
import time
import json

GPIO.setmode(GPIO.BCM)

@webiopi.macro
def init_adc_gpio(clk, mosi, miso, cs):
    GPIO.setup(int(clk),  GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(int(mosi), GPIO.OUT, initial=GPIO.LOW)
    GPIO.setup(int(miso), GPIO.IN,  pull_up_down=GPIO.PUD_DOWN)
    GPIO.setup(int(cs),   GPIO.OUT, initial=GPIO.HIGH)

@webiopi.macro
def read_adc(adcnum, clk, mosi, miso, cs):
    adcnum = int(adcnum)
    clk = int(clk)
    mosi = int(mosi)
    miso = int(miso)
    cs = int(cs)

    if adcnum > 7 or adcnum < 0:
        return -1
    GPIO.output(cs, GPIO.HIGH)
    GPIO.output(clk, GPIO.LOW)
    GPIO.output(cs, GPIO.LOW)

    commandout = adcnum
    commandout |= 0x18  # スタートビット＋シングルエンドビット
    commandout <<= 3    # LSBから8ビット目を送信するようにする
    for i in range(5):
        # LSBから数えて8ビット目から4ビット目までを送信
        if commandout & 0x80:
            GPIO.output(mosi, GPIO.HIGH)
        else:
            GPIO.output(mosi, GPIO.LOW)
        commandout <<= 1
        GPIO.output(clk, GPIO.HIGH)
        GPIO.output(clk, GPIO.LOW)
    adcout = 0
    # 13ビット読む（ヌルビット＋12ビットデータ）
    for i in range(13):
        GPIO.output(clk, GPIO.HIGH)
        GPIO.output(clk, GPIO.LOW)
        adcout <<= 1
        if i>0 and GPIO.input(miso)==GPIO.HIGH:
            adcout |= 0x1
    GPIO.output(cs, GPIO.HIGH)
    return adcout

@webiopi.macro
def get_direction_from_adc(clk, mosi, miso, cs):
    adc_out = read_adc(0, clk, mosi, miso. cs)

    # getting direction logic HERE

    context = {
        "direction": "forward",
        "adc_out": adc_out
    }
    return json.dumps(context)
