'use strict'

var mongoose = require('mongoose');
var port = 3200;
var app = require('./app');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/DBTwitterApp', {useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:false})
    .then(()=>{
        console.log('La conexion a la base de datos ha sido creada exitosamente');
        console.log('Bienvenido a nuestro Twitter en NodeJs, creado por Giancarlo Chicas.');
        app.listen(port, ()=>{
            console.log('El servidor está corriendo correctamente en el puerto', port);
        });
    }).catch(err =>{
        console.log('!Error al conectarse con la base de datos!', err);
    });