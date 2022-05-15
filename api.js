exports.use = function(app) {
    app.get('/api', test)

    app.post('/api/send', send);

    app.get('/api/daily/:limit?', daily);
    app.get('/api/weekly/:limit?', weekly);
    app.get('/api/monthly/:limit?', monthly);
    app.get('/api/environment/:limit?', environment);
    app.get('/api/events/:limit?', events);

}

const ConsumeEvents = require('./models');

function test(req, res) {
    res.send('Hello World');
}

function send(req, res) {
    const createdEvent = req.body.event;
    if (!createdEvent) {
        res.status(400).send("Please send ");
        return;
    }
    createdEvent.id = 1000;
    ConsumeEvents.create(createdEvent, (err, event) => {
        if (err) {
            res.status(500).send(err)
        } else {
            // send the data 
            res.status(200).send(event)
        }
    })
}

function daily(req, res) {
    const currentTime = new Date();
    const startOfDayTimestamp = currentTime.setHours(0, 0, 0, 0);
    ConsumeEvents.find({timestamp: {$gte: startOfDayTimestamp}})
        .select('waterLevel')
        .exec((err, events) => {
            if (err) {
                res.status(500).send(err);
            } else {
                // TODO: get consumption by the hour
                res.status(200).send(events)
            }
        }
    );

    // res.json({
    //     labels: ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
    //     data: [65, 59, 80, 81, 56, 55, 40],
    //     total: 1032,
    //     unit: 'ml'
    // });
}

function weekly(req, res) {
    const currentTime = new Date();
    const startOfWeekDay = currentTime.getDate() - currentTime.getDay();
    const firstDayOfWeek = new Date(currentTime.setDate(startOfWeekDay));
    const startOfWeekTimestamp = firstDayOfWeek.setHours(0, 0, 0, 0);
    ConsumeEvents.find({timestamp: {$gte: startOfWeekTimestamp}})
        .select('waterLevel')
        .exec((err, events) => {
            if (err) {
                res.status(500).send(err);
            } else {
                // TODO: get consumption by the day
                res.status(200).send(events)
            }
        }
    );

    // res.json({
    //     labels: ['Sunday', 'Monday', 'Tuesday', 'Wednsday', 'Thursday', 'Friday', 'Saturday'],
    //     data: [65, 59, 80, 81, 56, 55, 40, 63],
    //     total: 10032,
    //     unit: 'ml'
    // });
}

function monthly(req, res) {
    const currTime = new Date();
    const firstDayOfMonth = new Date(currTime.getFullYear(), currTime.getMonth(), 1);
    const firstDayOfMonthTimestamp = firstDayOfMonth.setHours(0, 0, 0, 0);
    ConsumeEvents.find({timestamp: {$gte: firstDayOfMonthTimestamp}})
        .select('waterLevel')
        .exec((err, events) => {
            if (err) {
                res.status(500).send(err);
            } else {
                // TODO: get consumption by the day
                res.status(200).send(events)
            }
        }
    );

    // res.json({
    //     labels: ['5/7', '5/8', '5/9', '5/10', '5/11', '5/12', '5/13'],
    //     data: [65, 59, 80, 81, 56, 55, 40, 63],
    //     total: 103,
    //     unit: 'l'
    // });
}

function environment(req, res) {
    const limit = req.params.limit === undefined ? 8 : req.params.limit;

    res.json({
        labels: ['5/7', '5/8', '5/9', '5/10', '5/11', '5/12', '5/13'],

        // humidity %
        data_humid: [42, 40, 45, 44, 43, 22, 30, 35],

        // Temperature in degrees C
        data_temp: [65, 59, 80, 81, 56, 55, 40, 63],

        average_humid: 45,
        average_temp: 70
    });
}

function events(req, res) {
    const limit = req.params.limit === undefined ? 8 : req.params.limit;

    ConsumeEvents.find({})
        .sort({date: -1})
        .limit(limit)
        .exec((err, events) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.json(events)
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
    //             timestamp: Date.now()
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