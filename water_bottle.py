from sense_hat import SenseHat
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

RADIUS = 3
HEIGHT = 14

water_level = 0

def send_to_server(water_consumed, temp, humid):
    response = requests.post(ENDPOINT, data = {'waterLevel': water_consumed, 'temperature': temp, 'humidity': humid, 'timestamp': datetime.now()})
    return

def read_ads(ref_sig=1):

    # Get I2C bus
    bus = smbus.SMBus(1)

    # ADS7830 address, 0x48(72)
    # Send command byte
    #       0x04(04)    Differential inputs, Channel-0, Channel-1 selected
    if ref_sig:
        bus.write_byte(0x48, 0x04)
    else:
        bus.write_byte(0x48, 0x00)

    time.sleep(0.5)

    # ADS7830 address, 0x48(72)
    # Read data back, 1 byte
    data = bus.read_byte(0x48)

    return data

def measure_water(sense):
    measured_water_level = 0
    number_of_measurements=10
    waterlevel_reads=[0]*number_of_measurements
    ref_sig=[0]*number_of_measurments

     for i in range(0,number_of_measurements):
        waterlevel_reads[i] = read_ads()
        ref_sig[i] = read_ads(ref_sig=0)
        time.sleep(.1)

    normalized_read = matrix(waterlevel_reads)/matrix(ref_sig) # divide the list of water levels by the corresponding reference signal at each measurement
    x = []
    y = []
    p = P.fit(x ,y ,2) # create second order polynomial
    sensor_inches=(p - np.mean(normalized_read)).roots()[1] # use the average normalized water level measurement to calculate inches of water the sensor is detecting
    r = RADIUS
    h = HEIGHT-(12.5-sensor_inches) # the max water sensor mark is exactly 22 inches from bottom of tank, so subtract 22 inches from current water level reading minus 12.5
    current_volume = (math.pi * math.pow(r,2) * h)/230.9993 # Calculates current volume in tank, based on sensor reading. 1 gal = 230.9993 in^3
    total_volume = (math.pi * math.pow(r,2) * HEIGHT)/230.9993 # calculates total volume of tank
    measured_water_level = current_volume/total_volume

    global water_level

    if measured_water_level < water_level:

        t = sense.get_temperature()
        h = sense.get_humidity()
        t = round(t, 2)
        h = round(h, 2)
        difference = water_level - measured_water_level
        water_level = measured_water_level
        send_to_server(difference, t, h)

    return measured_water_level 

def main():
    sense = SenseHat()
    sense.set_imu_config(False, True, True)

    global water_level
    water_level = measure_water(sense)

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
