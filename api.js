exports.use = function(app, sendNotification) {
    app.get('/api', (req, res) => {
        sendNotification('Notification Title', 'Notification Body');
        res.send('Hello World');
    })

    app.post('/api/send', (req, res) => {
        let createdEvent = req.body;
        createdEvent.deviceId = 5;

        if (!createdEvent) {
            res.status(400).send("Please send ");
            return;
        }
        ConsumeEvents.create(createdEvent, (err, event) => {
            if (err) {
                res.status(500).send(err)
            } else {
                // send the data 
                res.status(200).send(event)

                if(createdEvent.notify) {
                    sendNotification('🌊🌊🌊 Hydration Alert 🌊🌊🌊', `New Hydration Data! Water consumed: ${createdEvent.waterLevel} ml`);
                }
            }
        });
    });

    app.get('/api/daily/:limit?', daily);
    app.get('/api/weekly/:limit?', weekly);
    app.get('/api/monthly/:limit?', monthly);
    app.get('/api/environment/:limit?', environment);
    app.get('/api/events/:limit?', events);

}

const ConsumeEvents = require('./models');

function daily(req, res) {
    const hours = 8;
    const hourToMillis = 1000 * 60 * 60;
    const currentTime = new Date();
    
    const startTime = currentTime.setMinutes(0, 0, 0) - hourToMillis*hours;
    const startLabel = (new Date(startTime)).getHours();

    ConsumeEvents.find({timestamp: {$gte: startTime}})
        .select('waterConsumed timestamp')
        .sort({timestamp: 1})
        .exec((err, events) => {
            if (err) {
                res.status(500).send(err);
            } else {
                if(events.length === 0) {
                    res.json({
                        labels: ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
                        data: [65, 59, 80, 81, 56, 55, 40],
                        total: 1032,
                        unit: 'ml'
                    });
                    return;
                }

                // TODO: get consumption by the hour
                
                let waterHourBins = [];
                let total = 0;
                const hourMapping = {0:"1:00 AM", 1:"2:00 AM", 2:"3:00 AM", 3:"4:00 AM", 4:"5:00 AM", 5:"6:00 AM", 6:"7:00 AM", 7:"8:00 AM", 
                                    8:"9:00 AM", 9: "10:00AM", 10:"11:00 AM", 11:"12:00 PM", 12:"1:00 PM", 13:"2:00 PM", 14:"3:00 PM", 15:"4:00 PM",
                                    16:"5:00 PM", 17:"6:00 PM", 18:"7:00 PM", 19:"8:00 PM", 20: "9:00 PM", 21:"10:00 PM", 22:"11:00 PM", 23: "12:00 PM"};
                var timeLabels = [];

                for(let hour = 0; hour <= hours; hour++) {
                    let hourTotal = 0;
                    const hourStartTime = currentTime.setMinutes(0, 0, 0) - hourToMillis*(hours-hour);
                    const hourEndTime = currentTime.setMinutes(0, 0, 0) - hourToMillis*(hours-hour-1);

                    for (let i = 0; i < events.length; i++) {
                        if(hourStartTime <= events[i].timestamp && events[i].timestamp < hourEndTime) {
                            hourTotal += events[i].waterConsumed;
                        }
                    }

                    waterHourBins.push(hourTotal);
                    total += hourTotal;
                    timeLabels.push(hourMapping[((new Date(hourStartTime)).getHours()+18)%24]);
                }
                // for (let i = 1; i < events.length; i++) {
                //     while (currentTimestamp < events[i].timestamp) {
                //         waterHourBins.push(currentConsumption);
                //         currentConsumption = 0;
                //         currentTimestamp += hourToMillis;
                //         timeLabels.push(hourMapping[hourIndex]);
                //         hourIndex = (hourIndex+1)%24;
                //     }

                //     if (currentTimestamp >= events[i].timestamp) {
                //         var waterConsumed = prevWaterLevel - events[i].waterLevel;
                //         if (waterConsumed > 0) {
                //             currentConsumption += waterConsumed;
                //             total += waterConsumed;
                //         }
                //     }

                //     prevWaterLevel = events[i].waterLevel;
                // }
                // create data structure to send back
                res.status(200).json({
                    labels: timeLabels,
                    data: waterHourBins,
                    total: total,
                    unit: 'ml'
                });
            }
        }
    );


}

function weekly(req, res) {
    const currentTime = new Date();
    const startOfWeekDay = currentTime.getDate() - currentTime.getDay();
    const firstDayOfWeek = new Date(currentTime.setDate(startOfWeekDay));
    const startOfWeekTimestamp = firstDayOfWeek.setHours(0, 0, 0, 0);
    ConsumeEvents.find({timestamp: {$gte: startOfWeekTimestamp}})
        .select('waterConsumed timestamp')
        .sort({timestamp: 1})
        .exec((err, events) => {
            if (err) {
                res.status(500).send(err);
            } else {
                if(events.length === 0) {
                    res.json({
                        labels: ['Sunday', 'Monday', 'Tuesday', 'Wednsday', 'Thursday', 'Friday', 'Saturday'],
                        data: [65, 59, 80, 81, 56, 55, 40, 63],
                        total: 10032,
                        unit: 'ml'
                    });
                    return;
                }

                // TODO: get consumption by the day
                const dayToMillis = 1000 * 60 * 60 * 24;
                let currentTimestamp = startOfWeekTimestamp + dayToMillis;
                let waterDayBins = [];
                let total = 0;
                let currentConsumption = 0;
                let prevWaterLevel = events[0].waterLevel
                const dayMapping = {0:"Sunday", 1:"Monday", 2:"Tuesday", 3:"Wednesday", 4:"Thursday", 5:"Friday", 6:"Saturday"};
                let dayIndex = 0;
                let timeLabels = [];
                for (let i = 1; i < events.length; i++) {
                    while (currentTimestamp < events[i].timestamp) {
                        waterDayBins.push(currentConsumption);
                        currentConsumption = 0;
                        currentTimestamp += dayToMillis;
                        timeLabels.push(dayMapping[dayIndex]);
                        dayIndex += 1;
                    }

                    if (currentTimestamp >= events[i].timestamp) {
                        var waterConsumed = prevWaterLevel - events[i].waterLevel;
                        if (waterConsumed > 0) {
                            currentConsumption += waterConsumed;
                            total += waterConsumed;
                        }
                    } 

                    prevWaterLevel = events[i].waterLevel;
                }
                // create data structure to send back
                res.status(200).json({
                    labels: timeLabels,
                    data: waterDayBins,
                    total: total,
                    unit: 'ml'
                });
            }
        }
    );


}

function monthly(req, res) {
    const currTime = new Date();
    const firstDayOfMonth = new Date(currTime.getFullYear(), currTime.getMonth(), 1);
    const firstDayOfMonthTimestamp = firstDayOfMonth.setHours(0, 0, 0, 0);
    ConsumeEvents.find({timestamp: {$gte: firstDayOfMonthTimestamp}})
        .select('waterConsumed timestamp')
        .sort({timestamp: 1})
        .exec((err, events) => {
            if (err) {
                res.status(500).send(err);
            } else {
                if(events.length === 0) {
                    res.json({
                        labels: ['5/7', '5/8', '5/9', '5/10', '5/11', '5/12', '5/13'],
                        data: [65, 59, 80, 81, 56, 55, 40, 63],
                        total: 103,
                        unit: 'l'
                    });
                    return;
                }
                // TODO: get consumption by the day
                const dayToMillis = 1000 * 60 * 60 * 24;
                var currentTimestamp = firstDayOfMonthTimestamp + dayToMillis;
                var waterDayBins = [];
                var total = 0;
                var currentConsumption = 0;
                var prevWaterLevel = events[0].waterLevel
                var currentDay = 1;
                var timeLabels = [];
                for (let i = 1; i < events.length; i++) {
                    while(currentTimestamp < events[i].timestamp) {
                        waterDayBins.push(currentConsumption);
                        currentConsumption = 0;
                        currentTimestamp += dayToMillis;
                        timeLabels.push((currTime.getMonth()+1)+"/"+currentDay);
                        currentDay += 1;
                    }

                    if (currentTimestamp >= events[i].timestamp) {
                        var waterConsumed = prevWaterLevel - events[i].waterLevel;
                        if (waterConsumed > 0) {
                            currentConsumption += waterConsumed;
                            total += waterConsumed;
                        }
                    } 

                    prevWaterLevel = events[i].waterLevel;
                }
                // create data structure to send back
                res.status(200).json({
                    labels: timeLabels,
                    data: waterDayBins,
                    total: total,
                    unit: 'ml'
                });
            }
        }
    );


}

function environment(req, res) {
    // get all data limit days from today
    const limit = req.params.limit === undefined ? 8 : req.params.limit;
    const currentTime = new Date();
    const startingDay = currentTime.getDate() - limit;
    const startingDate = new Date(currentTime.setDate(startingDay));
    const startingTimestamp = startingDate.setHours(0, 0, 0, 0);
    // find all data and do processing
    ConsumeEvents.find({})
        .select('timestamp humidity temperature')
        .sort({timestamp: 1})
        .exec((err, events) => {
            if (err) {
                res.status(500).send(err);
            } else {
                if(events.length === 0) {
                    res.json({
                        labels: ['5/7', '5/8', '5/9', '5/10', '5/11', '5/12', '5/13'],
                        // humidity %
                        data_humid: [42, 40, 45, 44, 43, 22, 30, 35],
                        // Temperature in degrees C
                        data_temp: [65, 59, 80, 81, 56, 55, 40, 63],
                        average_humid: 45,
                        average_temp: 70
                    });
                    return;
                }

                // TODO: get consumption by the day
                const dayToMillis = 1000 * 60 * 60 * 24;
                var currentTimestamp = startingTimestamp + dayToMillis;
                var temperatureBins = [];
                var humidityBins = [];
                var averageTemp = 0;
                var averageHum = 0;
                var numEventsInDay = 0;
                var currentDay = 1;
                var timeLabels = [];
                for (let i = 1; i < events.length; i++) {
                    while(currentTimestamp < events[i].timestamp) {
                        temperatureBins.push(numEventsInDay > 0 ? averageTemp/numEventsInDay : 0);
                        humidityBins.push(numEventsInDay > 0 ? averageHum/numEventsInDay : 0);
                        currentTimestamp += dayToMillis;
                        timeLabels.push((currentTime.getMonth()+1)+"/"+currentDay);
                        currentDay += 1;
                        numEventsInDay = 0;
                    }
                    if (currentTimestamp >= events[i].timestamp) {
                        // get temperature and humidity
                        averageTemp += events[i].temperature;
                        averageHum += events[i].humidity;
                        numEventsInDay += 1;
                    }
                }
                // create data structure to send back
                res.status(200).json({
                    labels: timeLabels,
                    data_humid: humidityBins,
                    data_temp: temperatureBins,
                    average_humid: humidityBins.length > 0 ? humidityBins.reduce((a,b) => a+b) / humidityBins.length : 0,
                    average_temp: temperatureBins.length > 0 ? temperatureBins.reduce((a,b) => a+b) / temperatureBins.length : 0
                });
            }
        })



}

function events(req, res) {
    const limit = req.params.limit === undefined ? 8 : req.params.limit;

    ConsumeEvents.find({})
        .sort({timestamp: 1})
        .limit(limit)
        .exec((err, events) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).send(events);
            }
        }
    )

    // res.json({
    //     events: [
    //         {
    //             id: 3,
    //             device_id: 1001,
    //             temperature: 25,
    //             humidity: 50,
    //             water_level: 200,
    //             timestamp: 1652585112396
    //         },
    //         {
    //             id: 4,
    //             device_id: 1001,
    //             temperature: 25,
    //             humidity: 50,
    //             water_level: 200,
    //             timestamp: Date.now()
    //         },
    //         {
    //             id: 5,
    //             device_id: 1001,
    //             temperature: 25,
    //             humidity: 50,
    //             water_level: 200,
    //             timestamp: Date.now()
    //         },
    //         {
    //             id: 6,
    //             device_id: 1001,
    //             temperature: 25,
    //             humidity: 50,
    //             water_level: 200,
    //             timestamp: Date.now()
    //         },
    //         {
    //             id: 7,
    //             device_id: 1001,
    //             temperature: 25,
    //             humidity: 50,
    //             water_level: 200,
    //             timestamp: Date.now()
    //         },
    //         {
    //             id: 8,
    //             device_id: 1001,
    //             temperature: 25,
    //             humidity: 50,
    //             water_level: 200,
    //             timestamp: Date.now()
    //         },
    //         {
    //             id: 9,
    //             device_id: 1001,
    //             temperature: 25,
    //             humidity: 50,
    //             water_level: 200,
    //             timestamp: Date.now()
    //         },
    //         {
    //             id: 10,
    //             device_id: 1001,
    //             temperature: 25,
    //             humidity: 50,
    //             water_level: 200,
    //             timestamp: Date.now()
    //         },
    //         {
    //             id: 11,
    //             device_id: 1001,
    //             temperature: 25,
    //             humidity: 50,
    //             water_level: 200,
    //             timestamp: Date.now()
    //         }
    //     ]
    // });
}