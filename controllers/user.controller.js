//Giancarlo Emilio Antonio Chicas Álvarez // IN6AM // 2015136

//                                              TWITTER EN NODEJS

'use strict'

var User = require('../models/user.model');
var Tweet = require('../models/tweet.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

//Funcion Principal donde se gestionarán los comandos de Twitter
function commands(req, res) {
    var lineurl = req.body.command;
    var lineC = lineurl.split(" ");
    var params = req.body;
    var comando = lineC[0];
     
//Reconoceremos el comando ingresado por medio de este Switch
    switch(comando){

    case "REGISTER":
        var user = new User();
        var name = lineC[1];
        var email = lineC[2];
        var username = lineC[3];
        var password = lineC[4];

        if(name != null && email != null && username != null){
            User.findOne({$or:[{email: email}, {username: username}]}, (err, saveOk)=>{
                if(err){
                    res.status(500).send({message: 'Error general'});
                }else if(saveOk){
                    res.status(200).send({message: 'Usuario o correo ya han sido utilizados, intentelo denuevo con otros datos!'});
                }else{
                    user.name = name;
                    user.email = email;
                    user.username = username;
                bcrypt.hash(password, null, null, (err, passwordHash)=>{
                    if(err){
                        res.status(500).send({message: 'Error al encriptar Contraseña'});
                    }else if(passwordHash){
                        user.password = passwordHash;
                            user.save((err, userSave)=>{
                            if(err){
                                res.status(500).send({message: 'ERROR GENERAL'});
                            }else if(userSave){
                                res.status(200).send({message: 'Tu usuario ha sido creado correctamente!', user: userSave});
                            }else{
                                res.status(404).send({message: '!Vaya! tu usuario no ha sido guardado'});
                            }
                        });
                    }else{
                        res.status(404).send({message: 'ERROR// ha ocurrido un error inesperado'})
                    };
                });
            };
        });
        }else{
            res.send({message: 'Ingrese todos los datos'});
        };
    break;

    case "LOGIN":
        var username = lineC[1];
        var password = lineC[2];
        
        if(username != null || password != null){
            User.findOne({$or:[{username:username}, {password: password}]}, (err, Ok)=>{
                if(err){
                    res.status(500).send({message: 'ERROR GENERAL'});
                }else if(Ok){
                    bcrypt.compare(password, Ok.password, (err, pwdOk)=>{
                        if(err){
                            res.status(500).send({message: 'Error inesperado en el servidor'});
                        }else if(pwdOk){
                            if(params.gettoken = true){
                                res.send({token: jwt.createToken(Ok)});
                            }else{
                                res.send({message: 'Nos alegra que estes de vuelta! Bienvenido ', user:Ok})
                            };
                        }else{
                            res.send({message: 'Contraseña incorrecta, revisa tus datos!'});
                        }
                    });
                }else{
                    res.send({message: 'Datos de usuario incorrectos, intentelo denuevo porfavor!'});
                }
            });
        }else{
            res.send({message: 'Ingrese su Usuario y Contraseña registrada con anterioridad'});
        }
    break;

    case "PROFILE":
        var username = lineC[1];

        User.findOne({username: username}, { _id:0, password:0}, (err, searchUser)=>{
            if(err){
                res.status(500).send({message:err});
            }else if(searchUser){
                res.send({user: searchUser});
            }else{
                res.status(200).send({message: 'No hay datos existentes :('})
            }
        }).populate('tweet');
    break;

    case "FOLLOW":
        var username = lineC[1];
        
        User.findOne({username:username},{name:1, username:1, tweet:0, _id:0}, (err, searchUsername)=>{
            if(err){
                res.status(500).send({message:'ERROR GENERAL'});
            }else if(searchUsername){
                User.findOne({_id: req.user.sub, follow:{$elemMatch:{username:username}}},(err, findCount)=>{
                    if(err){
                        res.status(500).send({message:'Error inesperado en el servidor'});
                    }else if(findCount){
                        res.status(200).send({message:"!Vaya! ya has seguido a esta cuenta anteriormente"});
                    }else{
                        User.findByIdAndUpdate(req.user.sub, {$push:{follow: searchUsername}}, {new:true}, (err, updateFollow)=>{
                            if(err){
                                res.status(500).send({message:'Error inesperado en el servidor'});
                            }else if(updateFollow){
                                res.status(200).send({message:'!Excelente! Acabas de seguir a:', updateFollow});
                            }else{
                                res.status(404).send({message: "ERROR// No se ha logrado guardar al usuario"});
                            };
                        });
                    }
                });
            }else{
                res.status(404).send({message:"El usuario no existe! Intentelo denuevo"});
            }
        }).populate('tweet');
        
    break;

    case "UNFOLLOW":
        var username = lineC[1];

        User.findByIdAndUpdate(req.user.sub, {$pull:{follow:{username:username}}}, {new:true}, (err, unFollow) => {
            if(err){
                res.status(404).send({message:'Error general en el servidor'});
            } else if ( !unFollow ) {
                res.status(500).send({message: '!Vaya! no se ha podido dejar de seguir al usuario, intentelo denuevo'});
            } else {
                res.status(200).send({message:'!Listo! Ya no sigues está cuenta', unFollow});
            }
        }).populate('tweet');
    break;

    case "SEARCH_USER":
        var search = lineC[1];

        User.find({$or:[{username:{$regex: "^" + search, $options: 'i'}}]}, (err, userSearch)=>{
            if(err){
                res.status(500).send({message: 'Error inesperado en el servidor'});
            }else if(userSearch){
                res.status(200).send({message: 'Busquedas relacionadas... ', userSearch});
            }else{
                res.send({message: '!Vaya! No se han encontrado coinsidencias... Ingrese referencias o el nombre de usuario exacto'});
            }
        }).populate('tweet');
    break;

    case "ADD_TWEET":
        lineC.shift();
        var tweet = new Tweet();
        var cadena = lineC.join(" "); 

        tweet.username = req.user.username;
        tweet.date = new Date();
        tweet.text = cadena;
    
        tweet.save((err, tweetSave)=>{
            if(err){
                res.status(500).send({message: 'Error inesperado en el servidor', err});
            }else if(tweetSave){
                User.findByIdAndUpdate(req.user.sub, {$push:{tweet: tweetSave._id}}, {new:true}, (err, addTweet)=>{
                    if(err){
                        res.status(500).send({message: 'Error inesperado en el servidor'});
                    }else if(addTweet){
                        res.status(200).send({message: 'Tu publicacion ha sido creada correctamente! :', addTweet});
                    }else{
                        res.status(404).send({message:'Ingrese datos para su publicación porfavor!'});
                    }
                }).populate('tweet');
            }else{
                res.status(500).send({message: 'No se ha podido publicar tu tweet! Intentalo denuevo'});
            }
        });
    break;    

    case 'DELETE_TWEET':
        var tweetID = lineC[1];

        Tweet.findByIdAndDelete(tweetID, (err, tweetDelete)=>{
            if(err){
                res.status(500).send({message: 'Error inesperado en el servidor'});
            }else if(tweetDelete){
                res.status(200).send({message:'Tu tweet ha sido eliminado correctamente!'});
            }else{
                res.status(404).send({message: 'ERROR// Tu tweet no ha sido eliminado eliminado',err});
            }
        });
    break;

    case 'EDIT_TWEET':
        lineC.shift();
        var textID = lineC[0];
        lineC.shift();
        var cadena = lineC.join(" ");

        Tweet.findByIdAndUpdate(textID, {text:cadena}, {new:true}, (err, tweetUpdate)=>{
            if(err){
                res.status(500).send({message:'Error inesperado en el servidor'});
            }else if(tweetUpdate){
                res.status(200).send({tweet:tweetUpdate});
            }else{
                res.status(404).send({message:'Error al actualizar el tu publicacion, intente mas tarde porfavor'});
            }
        });
    break;

    case 'VIEW_TWEETS':
        var username = lineC[1];
        User.findOne({username:username},{tweet:1, _id:0}, (err, searchUsername)=>{
            if(err){
                res.status(500).send({message: 'Error inesperado en el servidor'});
            }else if(searchUsername){
                res.status(200).send({searchUsername});
            }else{
                res.status(404).send({message: 'No se han encontrado publicaciones'});
            }
        }).populate('tweet');
    break;

    default:
        res.status(500).send({message: '!Ingresa un comando válido porfavor! Intentalo denuevo'});
    break;
};
};

module.exports = {
    commands
};
