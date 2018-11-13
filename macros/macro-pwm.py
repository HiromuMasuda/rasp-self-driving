# coding: utf-8
# ======== WebIOPi用マクロ：PWMの設定 ========
import webiopi
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)
p = {}   # PWMのインスタンス変数

## GPIOポートをPWMモードで設定する
@webiopi.macro
def pwm_set_function(io):
    io = int(io)
    GPIO.setup(io, GPIO.OUT, initial=GPIO.LOW)
    p[io] = GPIO.PWM(int(io), 1000)  #1000Hz

## PWMの開始
@webiopi.macro
def pwm_start(io, freq, duty):
    io = int(io);
    p[io].ChangeFrequency(int(freq))
    p[io].start(int(duty))

## PWM周波数の変更
@webiopi.macro
def pwm_freq(io, freq):
    io = int(io)
    p[io].ChangeFrequency(int(freq))

## PWMデューティー比の変更
@webiopi.macro
def pwm_duty(io, duty):
    io = int(io)
    p[io].ChangeDutyCycle(int(duty))

## PWMの停止
@webiopi.macro
def pwm_stop(io):
    io = int(io)
    p[io].stop()
