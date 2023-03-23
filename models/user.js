const mongoose = require('mongoose')

const rivalSchema = new mongoose.Schema({
    summoner: { type: String, required: true, unique: true },
    tag: {type: String, required: true,} 
})

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    }, 
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    lastLoggin: {
        type: Date
    },
    createdDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    runeterra:{
        decks: [String],
        rivals: [rivalSchema]   
    }
})

module.exports = mongoose.model('User', userSchema)