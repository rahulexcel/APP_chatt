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
    //-------------------------------------------------------------
    
    Room.create_private_room = function ( accessToken, chat_with, currentTimestamp, callback) {
        var User = Room.app.models.User;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var owner_user_id = accessToken.userId;
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
            }
        });
        
    };
    Room.remoteMethod(
            'create_private_room', {
                description: 'create private room',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
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
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    Room.room_message = function ( msg_local_id,  accessToken, room_id, message, currentTimestamp, callback) {
        var User = Room.app.models.User;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var Message = Room.app.models.message;
                    var userId = accessToken.userId
                    User.findById(userId, function (err, userInfo) {
                        if (err) {
                            callback(null, 0, 'try again', {});
                        } else {
                            if( typeof userInfo == 'undefined' || userInfo == null ){
                                callback(null, 0, 'message user not found', {});
                            }else{
                                var check_where = {
                                    where : {
                                        room_users : {'in':[new ObjectID( userId )]},
                                        '_id' : new ObjectID( room_id )
                                    }
                                };
                                Room.find( check_where, function (err, result) {
                                    if( err ){
                                        callback(null, 0, 'try again', {});
                                    }else{
                                        if( result.length == 0 ){
                                            callback(null, 0, 'Room or User not exists', {});
                                        }else {
                                            var new_message = new Message({
                                                room_id : new ObjectID( room_id ),
                                                message_owner : new ObjectID( userId ),
                                                message : {
                                                    'type' : 'text',
                                                    'body' : message
                                                },
                                                message_time: currentTimestamp,
                                                message_status : 'sent'
                                            });
                                            new_message.save( function(err){
                                                if( err ){
                                                    callback(null, 0, 'try again', {});
                                                }else{
                                                    var data = {
                                                        msg_local_id : msg_local_id,
                                                        message_id : new_message.id,
                                                        message_status : new_message.message_status,
                                                        name : userInfo.name,
                                                        profile_image : userInfo.profile_image,
                                                        message : {
                                                            'type' : 'text',
                                                            'body' : message
                                                        }
                                                    }
                                                    callback(null, 1, 'Message posted', data );
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    };
    Room.remoteMethod(
            'room_message', {
                description: 'Send a message in room',
                accepts: [
                    {arg: 'msg_local_id', type: 'string'}, 
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'room_id', type: 'string'}, 
                    {arg: 'message', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/room_message',
                }
            }
    );
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    Room.list_my_rooms = function ( accessToken, currentTimestamp, callback) {
        var User = Room.app.models.User;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    userId = new ObjectID( userId );
                    Room.find({
                        "where": {room_users : {'in':[userId]}},
                        "include": [{
                            relation: 'room_owner', 
                            scope: {
                                fields: ['name','profile_image'],
                            }
                        },{
                            relation: 'room_users', 
                            scope: {
                                fields: ['name','profile_image'],
                            }
                        }]
                    },function (err, result) {
                        if( err ){
                            callback(null, 0, 'try again', {});
                        }else{
                            if( result.length > 0 ){
                                var data = {
                                    'rooms' : result
                                };
                                callback( null, 1, 'Rooms found', data );
                            }else{
                                callback( null, 0, 'No rooms found', {} );
                            }
                        }
                    });
                }
            }
        });
    };
    Room.remoteMethod(
            'list_my_rooms', {
                description: 'List logged user rooms',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/list_my_rooms',
                }
            }
    );
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    Room.list_room_messages = function ( accessToken, room_id, page, limit, currentTimestamp, callback) {
        var User = Room.app.models.User;
        var Message = Room.app.models.Message;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    userId = new ObjectID( userId );
                    Room.find({
                        "where" : {
                            room_users : {'in':[userId]},
                            _id : new ObjectID( room_id )
                        }
                    }, function( err, result ){
                        if( err ){
                            callback(null, 0, 'try again', {});
                        }else{
                            if( result.length == 0 ){
                                callback(null, 0, 'You are not a room user', {});
                            }else{
                                Message.find({
                                    "where" : {
                                        room_id : new ObjectID( room_id )
                                    },
                                    limit: limit,
                                    skip: page * limit * 1,
                                    order: 'message_time ASC',
                                    "include": [{
                                        relation: 'message_owner', 
                                        scope: {
                                            fields: ['name','profile_image'],
                                        }
                                    }]
                                }, function( err, result ){
                                    if( err ){
                                        callback(null, 0, 'try again', {});
                                    }else{
                                        var data = {
                                            'messages' : result
                                        }
                                        if( result.length == 0 ){
                                            callback( null, 0, 'No more messages', data );
                                        }else{
                                            callback( null, 1, 'Messages found', data );
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            }
        });
    };
    Room.remoteMethod(
            'list_room_messages', {
                description: 'Get room messages',
                accepts: [
                    {arg: 'accessToken', type: 'string'},
                    {arg: 'room_id', type: 'string'},
                    {arg: 'page', type: 'string'},
                    {arg: 'limit', type: 'string'},
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/list_room_messages',
                }
            }
    );
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    Room.update_message_status = function ( accessToken, room_id, message_id, status, currentTimestamp, callback) {
        var User = Room.app.models.User;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var Message = Room.app.models.message;
                    var userId = accessToken.userId
                    User.findById(userId, function (err, userInfo) {
                        if (err) {
                            callback(null, 0, 'try again', {});
                        } else {
                            if( typeof userInfo == 'undefined' || userInfo == null ){
                                callback(null, 0, 'message user not found', {});
                            }else{
                                var check_where = {
                                    where : {
                                        room_users : {'in':[new ObjectID( userId )]},
                                        '_id' : new ObjectID( room_id )
                                    }
                                };
                                Room.find( check_where, function (err, result) {
                                    if( err ){
                                        callback(null, 0, 'try again', {});
                                    }else{
                                        if( result.length == 0 ){
                                            callback(null, 0, 'Room or User not exists', {});
                                        }else {
                                            Message.findById( message_id, function( err, messageInfo){
                                                console.log( messageInfo);
                                                if( err ){
                                                    callback(null, 0, 'try again', {});
                                                }else{
                                                    if( typeof messageInfo == 'undefined' || messageInfo == null ){
                                                        callback(null, 0, 'message not found', {});
                                                    }else{
                                                         messageInfo.updateAttribute('message_status', status, function (err, minfo) {
                                                            if (err) {
                                                                callback(null, 0, 'Error', {});
                                                            } else {
                                                                var data = {
                                                                    room_id : minfo.room_id,
                                                                    message_id : minfo.id,
                                                                    message_status : minfo.message_status,
                                                                }
                                                                console.log( data );
                                                                
                                                                callback(null, 1, 'Status updated successfully', data );
                                                            }
                                                        });
                                                    }
                                                }
                                            }) 
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    };
    Room.remoteMethod(
            'update_message_status', {
                description: 'Send a message in room',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'room_id', type: 'string'}, 
                    {arg: 'message_id', type: 'string'}, 
                    {arg: 'status', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/update_message_status',
                }
            }
    );
    
    
    
    
    
    
//    //********************************* START REGISTER AND LOGIN **********************************
//    Room.create_private_room = function ( req, chat_with, currentTimestamp, callback) {
//        if( typeof req.accessToken == 'undefined' || req.accessToken == null || req.accessToken == '' || typeof req.accessToken.userId == 'undefined' || req.accessToken.userId == '' ){
//            callback(null, 0, 'UnAuthorized', {});
//        }else{
//            var access_token_userid = req.accessToken.userId;
//            Room.findById( access_token_userid, function(err, user) {
//                if( err ){
//                    callback(null, 0, 'UnAuthorized 1', {});
//                }else{
//                    var owner_user_id = access_token_userid;
//                    var room_users = [
//                        owner_user_id,
//                        chat_with
//                    ];
//                    var ru = room_users;
//                    for( var k in room_users ){
//                        room_users[k] = new ObjectID( room_users[k]);
//                    }
//                    var check_where = {
//                        where : {
//                            room_users : {'all':room_users}
//                        }
//                    };
//                    Room.find( check_where, function (err, result) {
//                        if( err ){
//                            callback(null, 0, 'try again', {});
//                        }else{
//                            if( result.length > 0 ){
//                                result = result[0];
//                                var room_id = result.id;
//                                var data = {
//                                    'room_id' : room_id
//                                };
//                                callback(null, 1, 'Room already exists', data);
//                            }else{
//                                var new_room = new Room({
//                                    room_owner : new ObjectID( owner_user_id ),
//                                    room_users : room_users,
//                                    registration_time: currentTimestamp,
//                                    registration_date: UTIL.currentDate(currentTimestamp),
//                                    registration_date_time: UTIL.currentDateTimeDay(currentTimestamp)
//                                });
//                                new_room.save( function(err){
//                                    if( err ){
//                                        callback(null, 0, 'try again', {});
//                                    }else{
//                                        var room_id = new_room.id;
//                                        var data = {
//                                            'room_id' : room_id
//                                        };
//                                        callback(null, 1, 'Chat Room Created', data);
//                                    }
//                                });
//                            }
//                        }
//                    });
//                }
//            });
//        }
//    };
//    Room.remoteMethod(
//            'create_private_room', {
//                description: 'Create a private chat room',
//                accepts: [
//                    {arg: 'req', type: 'object', 'http': {source: 'req'}},
//                    {arg: 'chat_with', type: 'string'}, 
//                    {arg: 'currentTimestamp', type: 'number'}
//                ],
//                returns: [
//                    {arg: 'status', type: 'number'},
//                    {arg: 'message', type: 'string'},
//                    {arg: 'data', type: 'array'}
//                ],
//                http: {
//                    verb: 'post', path: '/create_private_room',
//                }
//            }
//    );
//    //********************************* END REGISTER AND LOGIN ************************************   
};
