exports.use = function(app) {
    app.get('/api', test)

    app.post('/api/send', send);

    app.get('/api/daily/:limit?', daily);
    app.get('/api/weekly/:limit?', weekly);
    app.get('/api/monthly/:limit?', monthly);
    app.get('/api/environment/:limit?', environment);

}

function test(req, res) {
    res.send('Hello World');
}

function send(req, res) {
    res.send('Hello World');
}

function daily(req, res) {
    const limit = req.params.limit === undefined ? 7 : req.params.limit;

    console.log(limit);
    res.json({
        labels: ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
        data: [65, 59, 80, 81, 56, 55, 40],
        total: 1032,
        unit: 'ml'
    });
}

function weekly(req, res) {
    const limit = req.params.limit === undefined ? 8 : req.params.limit;

    res.json({
        labels: ['Sunday', 'Monday', 'Tuesday', 'Wednsday', 'Thursday', 'Friday', 'Saturday'],
        data: [65, 59, 80, 81, 56, 55, 40, 63],
        total: 10032,
        unit: 'ml'
    });
}

function monthly(req, res) {
    const limit = req.params.limit === undefined ? 8 : req.params.limit;

    res.json({
        labels: ['5/7', '5/8', '5/9', '5/10', '5/11', '5/12', '5/13'],
        data: [65, 59, 80, 81, 56, 55, 40, 63],
        total: 103,
        unit: 'l'
    });
}

function environment(req, res) {
    const limit = req.params.limit === undefined ? 8 : req.params.limit;

    res.json({
        labels: ['5/7', '5/8', '5/9', '5/10', '5/11', '5/12', '5/13'],

        // humidity %
        data_humid: [42, 40, 45, 44, 43, 22, 30, 35],

        // Temperature in degrees F
        data_temp: [65, 59, 80, 81, 56, 55, 40, 63],

        average_humid: 45,
        average_temp: 70
    });
}