const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConsumeEventsSchema = Schema({
    id: Number,
    timestamp: Number,
    temperature: Number,
    humidity: Number,
    waterLevel: Number
})

module.exports = mongoose.model('ConsumeEvents', ConsumeEventsSchema, 'consumeEvents');
