from ADCDevice import *
from datetime import datetime
import json
import math
import requests
from sense_hat import SenseHat
import time

ENDPOINT = "https://cs437.twong.dev/api/send"

RADIUS = 1.175
HEIGHT = 9.4
FULL = 174 # voltage = 2.25
EMPTY = 200 # voltage = 2.58
MAX_VOL = 22
MIN_FILL_DETECT = 10
ACCELERATION_THRESHOLD = 1.2

water_volume = 0

def send_to_server(water_consumed, temp, humid):
    response = requests.post(ENDPOINT, data = {'waterConsumed': water_consumed, 'temperature': temp, 'humidity': humid, 'timestamp': datetime.now()})
    return

def get_current_volume(adc):
    samples = [adc.analogRead(0) for x in range(10)]
    average = sum(samples)/len(samples)

    percent = (EMPTY-average)/(EMPTY-FULL)
    liquid_level = HEIGHT*percent
    volume = math.pi*math.pow(RADIUS, 2)*liquid_level*16.387064
    return volume

def measure_water(adc, sense):
    measured_water_volume = get_current_volume(adc)

    global water_volume

    if measured_water_volume+2 < water_volume:
        t = sense.get_temperature()
        h = sense.get_humidity()
        t = round(t, 2)
        h = round(h, 2)
        difference = round(water_volume - measured_water_volume, 2)
        print("{} ml of water consumed".format(difference))
        water_volume = measured_water_volume
        send_to_server(difference, t, h)
    elif measured_water_volume > water_volume + MIN_FILL_DETECT:
        water_volume = MAX_VOL

def main():
    sense = SenseHat()
    sense.set_imu_config(False, True, True)
    adc = ADCDevice()
    adc = ADS7830()

    global water_volume
    water_volume = get_current_volume(adc)

    while True:
        acceleration = sense.get_accelerometer_raw()
        x = acceleration['x']
        y = acceleration['y']
        z = acceleration['z']

        x = abs(x)
        y = abs(y)
        z = abs(z)

        if x > ACCELERATION_THRESHOLD or y > ACCELERATION_THRESHOLD or z > ACCELERATION_THRESHOLD:
            print("Motion Detected")
            sense.show_letter("!", (255,0,0))
            time.sleep(10)
            measure_water(adc, sense)
        else:
            sense.clear()

if __name__ == '__main__':
    main()