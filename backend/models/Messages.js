const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    message: { type: String, required: true },
    sender: { type: String, required: true },
    recipient: { type: String, required: true }
})

module.exports = mongoose.Schema(messageSchema);