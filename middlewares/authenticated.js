'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'ContraImposibleDeAdivinar'

exports.ensureAuth = (req, res, next)=>{
    var lineurl = req.body.command;
    var lineC = lineurl.split(" ");
    var comando = lineC[0]; 

    if(token == null){
        if (comando == "LOGIN" || comando == "REGISTER") {
            next();
        }else{
            if(!req.headers.authorization){
                return res.status(403).send({message: 'Peticion sin autenticacion'});
            }else{
                var token = req.headers.authorization.replace(/['"]+/g, '');
                    try{
                        var payload = jwt.decode(token, key);
                            if(payload.exp <= moment().unix()){
                                return res.status(401).send({message: '!Tu Token ha expirado! Vuelve a iniciar sesion porfavor!'});
                            }
                    }catch(ex){
                        return res.status(404).send({message: 'Tu Token no es valido'});
                    }
            req.user = payload;
            next();
            }
        }
    }
};
