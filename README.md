# rasp-self-driving
Self-driving program using raspberryPi and various of sensors.

## Usage

http://raspberrypi.local:8000/rasp-self-driving/rover.html


## GPIO APIs

### INPUT

```input.sh
#!/bin/sh
gpio -g mode 25 in
gpio -g mode 25 down
gpio -g read 25
```

```input.py
# coding: utf-8
import RPi.GPIO as GPIO

IO = 25

GPIO.setmode(GPIO.BCM)
GPIO.setup(IO, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

btn = GPIO.input(IO)
print("GPIO%d = %d" % (IO, btn))

GPIO.cleanup()
```

### OUTPUT

```output.sh
#!/bin/sh
gpio -g mode 24 out
gpio -g write 24 1
gpio -g write 24 0
```

```output.py
# coding: utf-8
import RPi.GPIO as GPIO

IO = 24

GPIO.setmode(GPIO.BCM)
GPIO.setup(IO, GPIO.OUT, initial=GPIO.LOW)

GPIO.output(IO, GPIO.HIGH) # 1, True
GPIO.output(IO, GPIO.LOW)  # 0, False

GPIO.cleanup()
```

### PWM

PWM stands for Pulse Width Modulation. DutyCycle is on/off ratio of PWM.

```pwm.py
p = GPIO.PWM(channel, frequency)
p.start(dc)   # where dc is the duty cycle (0.0 <= dc <= 100.0)
p.ChangeFrequency(freq)   # where freq is the new frequency in Hz
p.ChangeDutyCycle(dc)  # where 0.0 <= dc <= 100.0
p.stop()
```

### References
[raspberry-gpio-python](https://sourceforge.net/p/raspberry-gpio-python/wiki/BasicUsage/)



## WebIOPi
WebIOPi is the Raspberry Pi Internet of Things Toolkit. Webiopi has webiopi.js, the javascript library.

### APIs

```js
setFunction(port, mode, callbackFunc)
```
```js
digitalWrite(port, val, callbackFunc)
```
```js
digitalRead(port, callbackFunc)
```
```js
callMacro(macro, val, callbackFunc)
```

### INPUT

```input.js
webiopi().ready(function() {
  var port = 25;

  webiopi().digitalRead(port, function(io, data){
    if(data == 1) {
      $('#str1').html("ON");
    } else {
      $('#str1').html("OFF");
    }
  });
```

### OUTPUT

```output.js
webiopi().ready(function() {
  var port = 24;
  var val = 0;

  webiopi().setFunction(port, "OUT", function(){
    webiopi().digitalWrite(port, val);
  });

  $('#btn1').click(function() {
    val = (val) ? 0 : 1;
    webiopi().digitalWrite(port, val);
  });
});
```

### Macro

Register macros.

```macro.py
import webiopi

GPIO = webiopi.GPIO

@webiopi.macro
def set_gpio_pulldown(io, mode):
    pud = GPIO.PUD_OFF
    if mode.lower() == 'down':
        pud = GPIO.PUD_DOWN
    elif mode.lower() == 'up':
        pud = GPIO.PUD_UP
    GPIO.setFunction(int(io), GPIO.IN, pud)
```

Let the config file recognize the macro.

```/etc/webiopi/config
[SCRIPTS]
myscript1 = /home/pi/webiopi/test/macro-pud.py
```
Restart webiopi.

```
sudo systemctl restart webiopi
```

Read the macro to js file.

```macro.js
webiopi().ready(function() {
  var port = 25;
  webiopi().callMacro('set_gpio_pulldown', [port, 'down'] );
}
```

### References
[WebIOPi](http://webiopi.trouch.com/JAVASCRIPT.html)
