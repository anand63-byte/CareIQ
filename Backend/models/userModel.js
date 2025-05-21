const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB successfully")) // Log on successful connection
    .catch(err => console.error("MongoDB connection error:", err)); // Log on connection error

const userSchema = new mongoose.Schema({
    name: { 
        type: String,
    }, 
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    reports: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'reportModel', // Reference to the reportModel
        },
    ],
    doctors: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'drModel',
        }
      ],      
});

module.exports = mongoose.model('userModel', userSchema);