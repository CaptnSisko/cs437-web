from datetime import datetime
import random
import requests
import json
import math

ENDPOINT = 'https://cs437.twong.dev/api/send'

def send_data(water_consumed, temp, humid, timestamp):
    json_dict = {'waterConsumed': water_consumed, 'temperature': temp, 'humidity': humid, 'timestamp': timestamp}
    print('Sending data: ' + json.dumps(json_dict))
    #requests.post(ENDPOINT, json = json_dict)


# start 1 month ago
#start_time = math.floor(datetime.now().timestamp()*1000 - 2630000000)

# end one day ago
#end_time = math.floor(datetime.now().timestamp()*1000 - 86400000)

start_time = math.floor(datetime.now().timestamp()*1000 - 86400000)

print(math.floor(datetime.now().timestamp()*1000 - 9000000))

end_time = math.floor(datetime.now().timestamp()*1000)

total_water = 0

# current time to send the drinking
current_time = start_time
while current_time < end_time:

    current_date = datetime.fromtimestamp(current_time/1000)

    # pick some random values
    water_consumed = max(random.gauss(60, 10), 0)
    temp = random.gauss(38, 2)
    humid = random.gauss(45, 6)

    # drink more on weekends
    if current_date.weekday() > 4:
        water_consumed *= 1.3

    # unlikely to drink before 9am
    if current_date.hour < 9:
        if random.randint(0, 10) == 0:
            # drink a lot of water at once
            send_data(water_consumed*2, temp, humid, current_time)

            total_water += water_consumed*2
    
    # drink more water in morning
    elif current_date.hour < 12:
        if random.randint(0, 5) == 0:
            send_data(water_consumed, temp, humid, current_time)

            total_water += water_consumed
    # drink most water in afternoon
    elif current_date.hour < 17:
        if random.randint(0, 2) == 0:
            send_data(water_consumed, temp, humid, current_time)

            total_water += water_consumed

    else:
        if random.randint(0, 5) == 0:
            send_data(water_consumed, temp, humid, current_time)

            total_water += water_consumed

    # wait about 5-15 minutes between drinking
    current_time += random.randint(300000, 900000)



print(total_water/29)
