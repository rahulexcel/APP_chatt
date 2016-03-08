var UTIL = require('../modules/generic');
var ObjectID = require('mongodb').ObjectID;

module.exports = function (Room) {
    Room.disableRemoteMethod("create", true);
    Room.disableRemoteMethod("upsert", true);
    Room.disableRemoteMethod("updateAll", true);
    Room.disableRemoteMethod("updateAttributes", false);
    Room.disableRemoteMethod("find", true);
    Room.disableRemoteMethod("findById", true);
    Room.disableRemoteMethod("findOne", true);
    Room.disableRemoteMethod("deleteById", true);
    Room.disableRemoteMethod("login", true);
    Room.disableRemoteMethod("logout", true);
    Room.disableRemoteMethod("confirm", true);
    Room.disableRemoteMethod("count", true);
    Room.disableRemoteMethod("exists", true);
    Room.disableRemoteMethod("resetPassword", true);
    Room.disableRemoteMethod('createChangeStream', true);
    Room.disableRemoteMethod('__count__accessTokens', false);
    Room.disableRemoteMethod('__create__accessTokens', false);
    Room.disableRemoteMethod('__delete__accessTokens', false);
    Room.disableRemoteMethod('__destroyById__accessTokens', false);
    Room.disableRemoteMethod('__findById__accessTokens', false);
    Room.disableRemoteMethod('__get__accessTokens', false);
    Room.disableRemoteMethod('__updateById__accessTokens', false);
    //********************************* START REGISTER AND LOGIN **********************************
    Room.create_private_room = function ( req, chat_with, currentTimestamp, callback) {
        if( typeof req.accessToken == 'undefined' || req.accessToken == null || req.accessToken == '' || typeof req.accessToken.userId == 'undefined' || req.accessToken.userId == '' ){
            callback(null, 0, 'UnAuthorized', {});
        }else{
            var access_token_userid = req.accessToken.userId;
            Room.findById( access_token_userid, function(err, user) {
                if( err ){
                    callback(null, 0, 'UnAuthorized 1', {});
                }else{
                    var owner_user_id = access_token_userid;
                    var room_users = [
                        owner_user_id,
                        chat_with
                    ];
                    var ru = room_users;
                    for( var k in room_users ){
                        room_users[k] = new ObjectID( room_users[k]);
                    }
                    var check_where = {
                        where : {
                            room_users : {'all':room_users}
                        }
                    };
                    Room.find( check_where, function (err, result) {
                        if( err ){
                            callback(null, 0, 'try again', {});
                        }else{
                            if( result.length > 0 ){
                                result = result[0];
                                var room_id = result.id;
                                var data = {
                                    'room_id' : room_id
                                };
                                callback(null, 1, 'Room already exists', data);
                            }else{
                                var new_room = new Room({
                                    room_owner : new ObjectID( owner_user_id ),
                                    room_users : room_users,
                                    registration_time: currentTimestamp,
                                    registration_date: UTIL.currentDate(currentTimestamp),
                                    registration_date_time: UTIL.currentDateTimeDay(currentTimestamp)
                                });
                                new_room.save( function(err){
                                    if( err ){
                                        callback(null, 0, 'try again', {});
                                    }else{
                                        var room_id = new_room.id;
                                        var data = {
                                            'room_id' : room_id
                                        };
                                        callback(null, 1, 'Chat Room Created', data);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    };
    Room.remoteMethod(
            'create_private_room', {
                description: 'Create a private chat room',
                accepts: [
                    {arg: 'req', type: 'object', 'http': {source: 'req'}},
                    {arg: 'chat_with', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
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
