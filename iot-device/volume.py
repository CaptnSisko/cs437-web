import time
from ADCDevice import *
import math

RADIUS = 1.175
HEIGHT = 12 # 9.4
SERIESRESISTOR = 510
FULL = 174 # 7.2 inches, voltage = 2.25
EMPTY = 200 # voltage = 2.58

adc = ADCDevice()
adc = ADS7830()

samples = [adc.analogRead(0) for x in range(10)]
average = sum(samples)/len(samples)

average = 1023 / average - 1;
average = SERIESRESISTOR / average;

percent = (EMPTY-average)/(EMPTY-FULL)
liquid_level = HEIGHT*percent
volume = math.pi*math.pow(RADIUS, 2)*liquid_level
print(volume)