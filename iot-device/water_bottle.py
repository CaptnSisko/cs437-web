from sense_hat import SenseHat
from ADCDevice import *
import json
from datetime import datetime
import numpy as np
from numpy.polynomial import Polynomial as P
from numpy import matrix
import math
import requests

import smbus
import time

ENDPOINT = "https://cs437.twong.dev/api/send"

RADIUS = 1.175
HEIGHT = 12 #9.4
SERIESRESISTOR = 510
FULL = 174 # 7.2 inches, voltage = 2.25
EMPTY = 200 # voltage = 2.58

water_volume = 0

def send_to_server(water_consumed, temp, humid):
    response = requests.post(ENDPOINT, data = {'waterLevel': water_consumed, 'temperature': temp, 'humidity': humid, 'timestamp': datetime.now()})
    return

def get_current_volume(adc):
    samples = [adc.analogRead(0) for x in range(10)]
    avg = sum(samples)/len(samples)

    average = 1023 / average - 1;
    average = SERIESRESISTOR / average;

    percent = (EMPTY-average)/(EMPTY-FULL)
    liquid_level = HEIGHT*percent
    volume = math.pi*math.pow(RADIUS, 2)*liquid_level
    return volume

def measure_water(adc, sense):
    measured_water_volume = get_current_volume(adc)

    global water_volume

    if measured_water_volume < water_volume:
        t = sense.get_temperature()
        h = sense.get_humidity()
        t = round(t, 2)
        h = round(h, 2)
        difference = water_volume - measured_water_volume
        water_volume = measured_water_volume
        send_to_server(difference, t, h)

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

        if x > 1 or y > 1 or z > 1:
            sleep(25)
            measure_water(sense)
        else:
            sense.clear()

if __name__ == '__main__':
    main()