import machine
from machine import PWM
import dht
import time

# Temperature reading function (dht11)
# Use the D0 pin of the ESP8266 connected to the data pin of the sensor, then connect the GND of the sensor to the GND of the ESP and the VCC of the sensor to the 3V pin of the ESP.
# Pass the pin number 16 to the function parameter, which corresponds to the GPIO pin for D0 on the ESP8266.
def read_temperature(pin):
    d = dht.DHT11(machine.Pin(pin))
    while True:
        try:
            d.measure()
            temp = d.temperature()
            print("Temperature: {}°C".format(temp))
            return temp
        except Exception as e:
            print("Error reading temperature: {}".format(e))
            return null
        time.sleep(2)
        
def read_temperature_once(pin):
    d = dht.DHT11(machine.Pin(pin))
    try:
        d.measure()
        temp = d.temperature()
        print("Temperature: {}°C".format(temp))
        if (temp>25):
            sound_buzzer(2)
        return temp
    except Exception as e:
        print("Error reading temperature: {}".format(e))
        return None

# Humidity reading function (dht11)
# Same pin setup as the temperature reading function.
def read_humidity(pin):
    d = dht.DHT11(machine.Pin(pin))
    while True:
        try:
            d.measure()
            hum = d.humidity()
            print("Humidity: {}%".format(hum))
            return hum
        except Exception as e:
            print("Error reading humidity: {}".format(e))
            return null
        time.sleep(2)

def read_humidity_once(pin):
    d = dht.DHT11(machine.Pin(pin))
    try:
        d.measure()
        hum = d.humidity()
        print("Humidity: {}%".format(hum))
        return hum
    except Exception as e:
        print("Error reading humidity: {}".format(e))
        return null

def sound_buzzer(pin):
    beeper = machine.PWM(machine.Pin(pin))
    beeper.freq(100) 

    iteration_duration = 0.1  
    iterations = int(5 / (2 * iteration_duration))  

    for _ in range(iterations):
        beeper.duty_u16(32767) # low: 32767, high: 65534
        time.sleep(iteration_duration)

        beeper.duty_u16(0)
        time.sleep(iteration_duration)
    return True

def sound_buzzer_movement(pin):
    beeper = machine.PWM(machine.Pin(pin))
    beeper.freq(100) 
    beeper.duty_u16(32767) # low: 32767, high: 65534
    return True

def stop_sound_buzzer(pin):
    beeper = machine.PWM(machine.Pin(pin))
    beeper.duty_u16(0)

def detect_motion(pin, duration=20):
    pir = machine.Pin(pin, machine.Pin.IN)
    end_time = time.time() + duration
    while time.time() < end_time:
        if pir.value():
            print("Motion detected!")
            sound_buzzer_movement(2)
        else:
            print("No motion.")
            stop_sound_buzzer(2)
        time.sleep(1)
    stop_sound_buzzer(2)

