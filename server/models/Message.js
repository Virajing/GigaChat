const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    recipient: { type: String }, // Optional if groupId is present
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // Optional if recipient is present
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
