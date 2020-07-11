var jwt = require('jwt-simple');
var moment = require('moment'); //Captamos el momento en el que iniciamos sesion
var key = 'ContraImposibleDeAdivinar'

exports.createToken = (user)=>{
    var payload = {

        sub: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        password: user.String,
        iat: moment().unix(),
        exp: moment().add(5, "hours").unix() // !Tu sesion durara 5 horas!
    }
    return jwt.encode(payload, key);
}