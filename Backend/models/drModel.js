const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const drSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    patients: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'userModel' 
        },
    ],
});

module.exports = mongoose.model('drModel', drSchema);