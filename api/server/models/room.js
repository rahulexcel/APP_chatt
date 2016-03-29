var UTIL = require('../modules/generic');
var PUSH_NOTIFICATIONS = require('../modules/push_notifications');
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
    
    Room.create_room = function ( accessToken, room_type, chat_with, room_name, room_description, currentTimestamp, callback) {
        var User = Room.app.models.User;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var owner_user_id = accessToken.userId;
                    if( room_type == 'public'){
                        room_users = [ new ObjectID( owner_user_id ) ];
                        var new_room = new Room({
                            room_type : 'public',
                            room_owner : new ObjectID( owner_user_id ),
                            room_users_limit : 10*1,
                            room_users : room_users,
                            room_name : room_name,
                            room_description : room_description,
                            room_image : '',
                            room_background : '',
                            registration_time: currentTimestamp
                        });
                        new_room.save( function(err){
                            if( err ){
                                callback(null, 0, 'try again', {});
                            }else{
                                var room_id = new_room.id;
                                var data = {
                                    'room_id' : room_id,
                                    'room_type' : room_type
                                };
                                callback(null, 1, 'Public chat Room Created', data);
                            }
                        });
                    }else if( room_type == 'private'){
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
                                        room_type : 'private',
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
                                                'room_id' : room_id,
                                                'room_type' : room_type
                                            };
                                            callback(null, 1, 'Private Chat Room Created', data);
                                        }
                                    });
                                }
                            }
                        });
                    }else{
                        callback(null, 0, 'Room type is not correct', {});
                    }
                }
            }
        });
        
    };
    Room.remoteMethod(
            'create_room', {
                description: 'create private room',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'room_type', type: 'string'}, 
                    {arg: 'chat_with', type: 'string'}, 
                    {arg: 'room_name', type: 'string'}, 
                    {arg: 'room_description', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/create_room',
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
                                    },
                                    "include": [{
                                        relation: 'room_users'
                                    }]
                                };
                                Room.find( check_where, function (err, result) {
                                    if( err ){
                                        callback(null, 0, 'try again', {});
                                    }else{
                                        if( result.length == 0 ){
                                            callback(null, 0, 'Room or User not exists', {});
                                        }else {
                                            //----start---for push notification info--------
                                            var TOKENS = [];
                                            var msg_by_name = msg_by_profile_image = '';
                                            result.forEach(function(result) {
                                                room_info = result.toJSON();
                                                room_users = room_info.room_users;
                                                for( var k in room_users ){
                                                    var room_user_id = room_users[k].id;
                                                    if( room_user_id.toString() != userId.toString() ){
                                                        var user_tokens = room_users[k].token;
                                                        if( typeof user_tokens != 'undefined' && user_tokens  != ''){
                                                            TOKENS.push( user_tokens );
                                                        }
                                                    }else{
                                                        msg_by_name = room_users[k].name;
                                                        msg_by_profile_image = room_users[k].profile_image;
                                                    }
                                                }
                                            });
                                            //----end---for push notification info--------
                                            var server_time = UTIL.currentTimestamp();
                                            var new_message = new Message({
                                                room_id : new ObjectID( room_id ),
                                                message_owner : new ObjectID( userId ),
                                                message : {
                                                    'type' : 'text',
                                                    'body' : message
                                                },
                                                message_time: server_time,
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
                                                        },
                                                        message_time: server_time
                                                    }
                                                    //----start---for push notification message--------
                                                    if( TOKENS.length > 0 ){
                                                        var push_msg_info = {
                                                            'room_id' : room_id,
                                                            'message_owner_name' : msg_by_name,
                                                            'message_profile_image' : msg_by_profile_image,
                                                            'message_type' : 'text',
                                                            'message_body' : message,
                                                        };
                                                        PUSH_NOTIFICATIONS.PUSH_MESSAGE( TOKENS, push_msg_info, function( push_status, push_response ){
                                                        });   
                                                    }
                                                    //----end---for push notification message--------
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
    Room.list_my_rooms = function ( accessToken, room_type, currentTimestamp, callback) {
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
                        "where": {
                            room_users : {'in':[userId]},
                            room_type : room_type,
                        },
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
                    {arg: 'room_type', type: 'string'}, 
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
                                    order: 'message_time DESC',
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
        var org_message_id = message_id;
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
                                            var explode_message_ids = message_id.split(",");
                                            if( explode_message_ids.length == 0 ){
                                                callback(null, 0, 'empty message ids', {});
                                            }else{
                                                for( var k in explode_message_ids ){
                                                    explode_message_ids[k] = new ObjectID( explode_message_ids[k]);
                                                }
                                                Message.find({
                                                    "where": {
                                                        id : {'in':explode_message_ids},
                                                        'room_id' : new ObjectID( room_id )
                                                    }
                                                },function (err, result) {
                                                    if( err ){
                                                        callback(null, 0, 'try again', {});
                                                    }else{
                                                        if( result.length == 0 ){
                                                            callback(null, 0, 'room message not found', {});
                                                        }else{
                                                            Message.updateAll({id: {'in':explode_message_ids} },{message_status: 'seen'},function (err) {
                                                                if (err) {
                                                                    callback(null, 0, 'try again', {});
                                                                } else {
                                                                    var data = {
                                                                        room_id : room_id,
                                                                        message_id : org_message_id,
                                                                        message_status : 'seen',
                                                                    }
                                                                    callback(null, 1, 'Status updated successfully', data );
                                                                }
                                                            });
                                                        }
                                                    }
                                                });
                                            }
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
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    // logged in user will be able to join a public room using this
    Room.join_public_room = function ( accessToken, room_id, currentTimestamp, callback) {
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
                        "where" : {
                            room_type : 'public',
                            _id : new ObjectID( room_id )
                        }
                    }, function( err, result ){
                        if( err ){
                            callback(null, 0, 'try again', {});
                        }else{
                            if( result.length == 0 ){
                                callback(null, 0, 'Public room not exists', {});
                            }else{
                                Room.find({
                                    "where" : {
                                        room_type : 'public',
                                        _id : new ObjectID( room_id ),
                                        room_users : {'in':[userId]},
                                    }
                                }, function( err1, result1 ){
                                    if( err1 ){
                                        callback(null, 0, 'try again', {});
                                    }else{
                                        if( result1.length > 0 ){
                                            var data = {
                                                room_id : room_id
                                            }
                                            callback(null, 2, 'Already room member', data );
                                        }else{
                                            Room.update({
                                                room_type : 'public',
                                                _id : new ObjectID( room_id )
                                            },{
                                                '$push': {'room_users': userId }
                                            },{ 
                                                allowExtendedOperators: true 
                                            },function (err, result2) {
                                                if (err) {
                                                    callback(null, 0, 'try again', {});
                                                } else {
                                                    var data = {
                                                        room_id : room_id
                                                    }
                                                    callback(null, 1, 'Public room joined', data );
                                                }
                                            });
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
            'join_public_room', {
                description: 'Get room messages',
                accepts: [
                    {arg: 'accessToken', type: 'string'},
                    {arg: 'room_id', type: 'string'},
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/join_public_room',
                }
            }
    );
};
