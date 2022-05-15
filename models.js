const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConsumeEventsSchema = Schema({
    deviceId: Number,
    timestamp: Number,
    temperature: Number,
    humidity: Number,
    waterConsumed: Number
})

module.exports = mongoose.model('ConsumeEvents', ConsumeEventsSchema, 'consumeEvents');
