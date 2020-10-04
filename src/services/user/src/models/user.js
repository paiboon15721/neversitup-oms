const mongoose = require('mongoose')

const { Schema } = mongoose

const userSchema = new Schema({}, { strict: false })

mongoose.model('User', userSchema)
