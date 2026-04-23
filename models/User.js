const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,

    email: {
        type: String,
        unique: true
    },

    password: String,

    role: {
        type: String,
        enum: ['citizen', 'admin'],   // only these allowed
        default: 'citizen'
    }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);