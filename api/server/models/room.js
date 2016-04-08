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
    
    Room.create_room = function ( accessToken, room_type, chat_with, room_name, room_description, currentTimestamp, callback) {
        var User = Room.app.models.User;
        var Pushmessage = Room.app.models.Pushmessage;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var owner_user_id = accessToken.userId;
                    if( room_type == 'public'){
                        room_name = room_name.trim();
                        room_name_capital = room_name.toUpperCase();
                        room_users = [ new ObjectID( owner_user_id ) ];
                        var new_room = new Room({
                            room_type : 'public',
                            room_owner : new ObjectID( owner_user_id ),
                            room_users_limit : 10*1,
                            room_users : room_users,
                            room_name : room_name,
                            room_name_capital : room_name_capital,
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
                                room_type : 'private',
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
                                            //-start-send push message to user 
                                            User.FN_get_user_by_id( chat_with, function( u_status, u_message, u_data ){
                                                if( u_status == 1 ){
                                                    var TOKENS = [ u_data.token ];
                                                    var push_msg_info = {
                                                        name : u_data.name,
                                                        profile_image : u_data.profile_image,
                                                        room_id : room_id,
                                                    }
                                                    Pushmessage.create_push_message( 'private_room_created', TOKENS , push_msg_info, function( ignore_param, p_status, p_message, p_data){
                                                    })  
                                                }
                                            })
                                            //-end-send push message to user
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
    Room.room_message = function ( msg_local_id,  accessToken, room_id, message_type, message, currentTimestamp, callback) {
        var User = Room.app.models.User;
        var Pushmessage = Room.app.models.Pushmessage;
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
                                                    'type' : message_type,
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
                                                            'type' : message_type,
                                                            'body' : message
                                                        },
                                                        message_time: server_time
                                                    }
                                                    //----start---for push notification message--------
                                                    if( TOKENS.length > 0 ){
                                                        var push_msg_info = {
                                                            'message_id' : new_message.id.toString(),
                                                            'room_id' : room_id,
                                                            'message_owner_name' : msg_by_name,
                                                            'message_profile_image' : msg_by_profile_image,
                                                            'message_type' : message_type,
                                                            'message_body' : message,
                                                        }
                                                        Pushmessage.create_push_message( 'room_message', TOKENS , push_msg_info, function( ignore_param, p_status, p_message, p_data){
                                                        })  
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
                    var logged_user_id = userId;
                    userId = new ObjectID( userId );
                    
                    if( room_type == 'all' ){
                        var wh = {
                            room_users : {'in':[userId]},
                        }
                    }else{
                        var wh = {
                            room_users : {'in':[userId]},
                            room_type : room_type,
                        }
                    }
                    
                    Room.find({
                        "where": wh,
                        "include": [{
                            relation: 'room_owner', 
                            scope: {
                                fields: ['name','profile_image','last_seen'],
                            }
                        },{
                            relation: 'room_users', 
                            scope: {
                                fields: ['name','profile_image','last_seen'],
                            }
                        }]
                    },function (err, result) {
                        if( err ){
                            callback(null, 0, 'try again', {});
                        }else{
                            if( result.length > 0 ){
                                var new_result = [];
                                for( var k in result ){
                                    kr = result[k];
                                    kr = kr.toJSON();
                                    kr_room_type = kr.room_type;
                                    kr_room_users = kr.room_users
                                    
                                    var show_details_for_list = {};
                                    if( kr_room_type == 'private' ){
                                        for( var k1 in kr_room_users ){
                                            k1_user = kr_room_users[k1];
                                            k1_user_id = k1_user.id;
                                            if( logged_user_id.toString() != k1_user_id.toString() ){
                                                show_details_for_list = {
                                                    'icon' : k1_user.profile_image,
                                                    'main_text' : k1_user.name,
                                                    'sub_text' : k1_user.last_seen
                                                }
                                            }
                                        }
                                    }else if( kr_room_type == 'public' ){
                                        show_details_for_list = {
                                            'icon' : kr.room_image,
                                            'main_text' : kr.room_name,
                                            'sub_text' : kr.room_description,
                                        }
                                    }
                                    kr.show_details_for_list = show_details_for_list;
                                    new_result.push( kr );
                                }
                                var data = {
                                    'rooms' : new_result
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
    
    //********************************* START LIST OF ALL public rooms **********************************
    Room.get_public_rooms = function ( accessToken, page, limit, currentTimestamp, callback) {
        var User = Room.app.models.User;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 401, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 401, 'UnAuthorized', {});
                }else{
                    var access_token_userid = accessToken.userId
                    
                    var num = 0;
                    num = page * 1;
                    User.findById(access_token_userid, function (err, user) {
                        if (err) {
                            callback(null, 0, 'UnAuthorized', err);
                        } else {
                            var where = {
                                'room_type' : 'public',
                                'room_users': {'nin': [new ObjectID( access_token_userid )] },
                            };
                            Room.find({
                                "where": where,
                                "limit": limit,
                                "skip": num * limit,
                                "order": 'room_name_capital ASC',
                                "include": [{
                                    relation: 'room_owner', 
                                    scope: {
                                        fields: ['name','profile_image','last_seen'],
                                    }
                                },{
                                    relation: 'room_users', 
                                    scope: {
                                        fields: ['name','profile_image','last_seen'],
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
                    });
                }
            }
        });
    };
    Room.remoteMethod(
            'get_public_rooms', {
                description: 'get all public rooms',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'page', type: 'number'},
                    {arg: 'limit', type: 'number'},
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/get_public_rooms',
                }
            }
    );
    //********************************* END LIST OF ALL USERS ************************************ 
    
    //********************************* START get room info **********************************
    Room.get_room_info = function ( accessToken, room_id, currentTimestamp, callback) {
        var User = Room.app.models.User;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 401, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 401, 'UnAuthorized', {});
                }else{
                    var access_token_userid = accessToken.userId
                    User.findById(access_token_userid, function (err, user) {
                        if (err) {
                            callback(null, 401, 'UnAuthorized', err);
                        } else {
                            var where = {
                                'id' : new ObjectID( room_id )
                            };
                            Room.find({
                                "where": where,
                                "include": [{
                                    relation: 'room_owner', 
                                    scope: {
                                        fields: ['name','profile_image','last_seen'],
                                    }
                                },{
                                    relation: 'room_users', 
                                    scope: {
                                        fields: ['name','profile_image','last_seen'],
                                    }
                                }]
                            },function (err, result) {
                                if( err ){
                                    callback(null, 0, 'try again', {});
                                }else{
                                    if( result.length > 0 ){
                                        result = result[0];
                                        var is_room_owner = 0;
                                        result = result.toJSON();
                                        if( result['room_owner'].id.toString() == access_token_userid.toString() ){
                                            is_room_owner = 1;
                                        }
                                        result.is_room_owner = is_room_owner;
                                        var data = {
                                            'room' : result
                                        };
                                        callback( null, 1, 'Room found', data );
                                    }else{
                                        callback( null, 0, 'No room found', {} );
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    };
    Room.remoteMethod(
            'get_room_info', {
                description: 'get room info',
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
                    verb: 'post', path: '/get_room_info',
                }
            }
    );
    //********************************* END get room info ************************************ 
    
    
    //********************************* START leave public room **********************************
    Room.leave_public_group = function ( accessToken, room_id, currentTimestamp, callback) {
        var User = Room.app.models.User;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 401, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 401, 'UnAuthorized', {});
                }else{
                    var access_token_userid = accessToken.userId
                    User.findById(access_token_userid, function (err, user) {
                        if (err) {
                            callback(null, 401, 'UnAuthorized', err);
                        } else {
                            userId = new ObjectID( access_token_userid );
                            var wh = {
                                id : new ObjectID( room_id ),
                                room_users : {'in':[userId]}
                            }
                            Room.find({
                                "where": wh,
                                "include": [{
                                    relation: 'room_owner', 
                                    scope: {
                                        fields: ['name','profile_image','last_seen'],
                                    }
                                },{
                                    relation: 'room_users', 
                                    scope: {
                                        fields: ['name','profile_image','last_seen'],
                                    }
                                }]
                            },function (err, result) {
                                if( err ){
                                    callback(null, 0, 'try again', {});
                                }else{
                                    if( result.length > 0 ){
                                        result = result[0];
                                        result = result.toJSON();
                                        room_owner = result.room_owner;
                                        room_users = result.room_users;
                                        if( room_owner.id.toString() == access_token_userid.toString() ){
                                            callback( null, 0, "Admin can't leave group", data );
                                        }else{
                                            left_user_info = {};
                                            for( var k in room_users ){
                                                if( room_users[k].id.toString() == access_token_userid.toString() ){
                                                    left_user_info = {
                                                        user_id : room_users[k].id,
                                                        name : room_users[k].name,
                                                        profile_image : room_users[k].profile_image,
                                                    }
                                                }
                                            }
                                            Room.update({
                                                id : new ObjectID( room_id ),
                                            },{
                                                '$pull': {'room_users': userId }
                                            },{ 
                                                allowExtendedOperators: true 
                                            },function (err, result2) {
                                                if (err) {
                                                    callback(null, 0, 'try again', {});
                                                } else {
                                                    var data = {
                                                        room_id : room_id,
                                                        left_user_info : left_user_info
                                                    }
                                                    callback(null, 1, 'Public room left', data );
                                                }
                                            });
                                        }
                                    }else{
                                        callback( null, 0, 'No permission', {} );
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    };
    Room.remoteMethod(
            'leave_public_group', {
                description: 'user will able to leave a public group',
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
                    verb: 'post', path: '/leave_public_group',
                }
            }
    );
    //********************************* END leave public room ************************************ 
    
    
    //********************************* START remove public member by admin **********************************
    Room.remove_public_room_member = function ( accessToken, room_id, user_id, currentTimestamp, callback) {
        Pushmessage = Room.app.models.Pushmessage;
        var User = Room.app.models.User;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 401, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 401, 'UnAuthorized', {});
                }else{
                    var access_token_userid = accessToken.userId
                    User.findById(access_token_userid, function (err, user) {
                        if (err) {
                            callback(null, 401, 'UnAuthorized', err);
                        } else {
                            userId = new ObjectID( access_token_userid );
                            var wh = {
                                id : new ObjectID( room_id )
                            }
                            Room.find({
                                "where": wh,
                                "include": [{
                                    relation: 'room_owner', 
                                    scope: {
                                        fields: ['name','profile_image','last_seen'],
                                    }
                                },{
                                    relation: 'room_users', 
                                    scope: {
                                        fields: ['name','profile_image','last_seen'],
                                    }
                                }]
                            },function (err, result) {
                                if( err ){
                                    callback(null, 0, 'try again', {});
                                }else{
                                    if( result.length > 0 ){
                                        result = result[0];
                                        result = result.toJSON();
                                        room_owner = result.room_owner;
                                        room_users = result.room_users;
                                        
                                        if( room_owner.id.toString() == access_token_userid.toString() ){
                                            if( access_token_userid.toString() == user_id.toString() ){
                                                callback( null, 0, "Admin can't remove", {} );
                                            }else{
                                                var remove_user_info = {};
                                                var remove_users_exists = false;
                                                for( var k in room_users ){
                                                    kr = room_users[k];
                                                    if( kr.id.toString() == user_id.toString() ){
                                                        remove_users_exists = true;
                                                        remove_user_info = {
                                                            user_id : kr.id,
                                                            name : kr.name,
                                                            profile_image : kr.profile_image,
                                                        }
                                                    }
                                                }
                                                if( remove_users_exists == false ){
                                                    callback( null, 0, "User is not room member", {} );
                                                }else{
                                                    
                                                    Room.update({
                                                        id : new ObjectID( room_id ),
                                                    },{
                                                        '$pull': {'room_users': new ObjectID( user_id ) }
                                                    },{ 
                                                        allowExtendedOperators: true 
                                                    },function (err, result2) {
                                                        if (err) {
                                                            callback(null, 0, 'try again', {});
                                                        } else {
                                                            var data = {
                                                                room_id : room_id,
                                                                left_user_info : remove_user_info
                                                            }
                                                            callback(null, 1, 'User removed from room', data );
                                                            //-start-send push message to removed user 
                                                            User.FN_get_user_by_id( user_id, function( u_status, u_message, u_data ){
                                                                if( u_status == 1 ){
                                                                    var TOKENS = [ u_data.token ];
                                                                    var push_msg_info = {
                                                                        name : u_data.name,
                                                                        profile_image : u_data.profile_image,
                                                                        room_id : room_id,
                                                                    }
                                                                    Pushmessage.create_push_message( 'remove_public_room_member', TOKENS , push_msg_info, function( ignore_param, p_status, p_message, p_data){
                                                                    })  
                                                                }
                                                            })
                                                            //-end-send push message to removed user 
                                                        }
                                                    });
                                                }
                                            }
                                        }else{
                                            callback( null, 0, 'You are not admin of this group', {} );
                                        }
                                    }else{
                                        callback( null, 0, 'Room not found', {} );
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    };
    Room.remoteMethod(
            'remove_public_room_member', {
                description: 'Admin power to remove group member',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'room_id', type: 'string'},
                    {arg: 'user_id', type: 'string'},
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/remove_public_room_member',
                }
            }
    );
    //********************************* END remove public member by admin **********************************
    
};
