'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Modelo de los Tweets

var tweetSchema = Schema({
    username: String,
    text: String,
    date: String,
});

module.exports = mongoose.model('tweet', tweetSchema);