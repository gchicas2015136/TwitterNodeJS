'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Modelo del usuario

var userSchema = Schema({
    name: String,
    email: String,
    username: String,
    follow:[{}],
    password: String,
    tweet:[{ type: Schema.Types.ObjectId, ref:'tweet'}]
});

module.exports = mongoose.model('user', userSchema);

