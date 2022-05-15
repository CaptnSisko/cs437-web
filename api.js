exports.use = function(app, sendNotification) {
    app.get('/api', (req, res) => {
        sendNotification('Notification Title', 'Notification Body');
        res.send('Hello World');
    })

    app.post('/api/send', send);

    app.get('/api/daily/:limit?', daily);
    app.get('/api/weekly/:limit?', weekly);
    app.get('/api/monthly/:limit?', monthly);
    app.get('/api/environment/:limit?', environment);
    app.get('/api/events/:limit?', events);

}

function test(req, res) {
    res.send('Hello World');
}

function send(req, res) {
    res.send('Hello World');
}

function daily(req, res) {
    const limit = req.params.limit === undefined ? 7 : req.params.limit;
    res.json({
        labels: ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
        data: [65, 59, 20, 25, 56, 55, 40],
        total: 999,
        unit: 'ml'
    });
}

function weekly(req, res) {
    const limit = req.params.limit === undefined ? 8 : req.params.limit;

    res.json({
        labels: ['Sunday', 'Monday', 'Tuesday', 'Wednsday', 'Thursday', 'Friday', 'Saturday'],
        data: [65, 59, 80, 81, 56, 22, 40, 63],
        total: 10012,
        unit: 'ml'
    });
}

function monthly(req, res) {
    const limit = req.params.limit === undefined ? 8 : req.params.limit;

    res.json({
        labels: ['5/7', '5/8', '5/9', '5/10', '5/11', '5/12', '5/13'],
        data: [65, 22, 22, 22, 22, 55, 40, 63],
        total: 432,
        unit: 'l'
    });
}

function environment(req, res) {
    const limit = req.params.limit === undefined ? 8 : req.params.limit;

    res.json({
        labels: ['5/7', '5/8', '5/9', '5/10', '5/11', '5/12', '5/13'],

        // humidity %
        data_humid: [42, 66, 66, 66, 66, 22, 420, 35],

        // Temperature in degrees C
        data_temp: [44, 44, 80, 81, 44, 44, 44, 63],

        average_humid: 420,
        average_temp: 69
    });
}

function events(req, res) {
    const limit = req.params.limit === undefined ? 8 : req.params.limit;

    res.json({
        events: [
            {
                id: 3,
                device_id: 1001,
                temperature: 25,
                humidity: 50,
                water_level: 200,
                timestamp: Date.now()
            },
            {
                id: 4,
                device_id: 1001,
                temperature: 25,
                humidity: 50,
                water_level: 200,
                timestamp: Date.now()
            },
            {
                id: 5,
                device_id: 1001,
                temperature: 25,
                humidity: 50,
                water_level: 200,
                timestamp: Date.now()
            },
            {
                id: 6,
                device_id: 1001,
                temperature: 25,
                humidity: 50,
                water_level: 200,
                timestamp: Date.now()
            },
            {
                id: 7,
                device_id: 1001,
                temperature: 25,
                humidity: 50,
                water_level: 200,
                timestamp: Date.now()
            },
            {
                id: 8,
                device_id: 1001,
                temperature: 25,
                humidity: 50,
                water_level: 200,
                timestamp: Date.now()
            },
            {
                id: 9,
                device_id: 1001,
                temperature: 25,
                humidity: 50,
                water_level: 200,
                timestamp: Date.now()
            },
            {
                id: 10,
                device_id: 1001,
                temperature: 25,
                humidity: 50,
                water_level: 200,
                timestamp: Date.now()
            },
            {
                id: 11,
                device_id: 1001,
                temperature: 25,
                humidity: 50,
                water_level: 200,
                timestamp: Date.now()
            }
        ]
    });
}