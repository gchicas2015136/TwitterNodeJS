'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var api = express.Router();
var mdAuth = require('../middlewares/authenticated');
var connectMultiparty = require('connect-multiparty');

//Ruta General de los comandos 
api.post('/commands', mdAuth.ensureAuth, userController.commands);

module.exports = api;

