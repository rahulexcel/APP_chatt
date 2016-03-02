var UTIL = require('../modules/generic');
var lodash = require('lodash');
var moment = require('moment');
var generatePassword = require('password-generator');

module.exports = function (User) {
    //********************************* START REGISTER AND LOGIN **********************************
    User.create_private_room = function ( req, callback) {
        
        //console.log( req );
        
        //console.log( user1);
        //console.log( user1);
        
        callback(null, 0, 'Invalid login', {});
        
    };
    User.remoteMethod(
            'create_private_room', {
                description: 'Create a private room',
                accepts: [
                    {arg: 'req', type: 'object', 'http': {source: 'req'}},
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/create_private_room',
                }
            }
    );
//********************************* END REGISTER AND LOGIN ************************************    

};
