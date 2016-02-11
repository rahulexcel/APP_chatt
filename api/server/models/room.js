var app = require('../../server/server');

var GENERIC = require('../modules/generic');

module.exports = function(Room) {
    Room.create_room = function( owner_user_id, room_type, room_name, users_to_chat, callback ){
        console.log( owner_user_id );
        console.log( room_type );
        console.log( room_name );
        console.log( users_to_chat );
        
        if( room_type == 'private' ){
            var request_from = request_to = room_owner = room_name = '';
            var request_accepted = 0;
            var room_users = [];
            
            request_from = GENERIC.get_mongo_objectid(owner_user_id);
            request_to = GENERIC.get_mongo_objectid(users_to_chat);
            
            room_users.push( request_from );
            room_users.push( request_to );
            room_owner = GENERIC.get_mongo_objectid( owner_user_id );
            
            where_check_room_exists = {
                room_users : room_users
            }
            console.log( where_check_room_exists );
            
            Room.find({where : where_check_room_exists}, function( err, result ){
                if( err ){
                    
                }else{
                    if( result.length > 0 ){
                        console.log('already exists');
                    }else{
                        console.log( 'already exists not');
                        var newUser = new Room({
                            room_type : 'private',
                            room_name : room_name,
                            room_owner : room_owner,
                            request_from : request_from,
                            request_to : request_to,
                            room_users : room_users,
                            request_accepted : request_accepted
                        });
                        newUser.save( function( err, result ){
                            if( err ){
                                console.log( err );
                                callback(null, 0, 'Some Error Occurs', {} );
                            }else{
                                callback(null, 1, 'Private room created', {} );
                            }
                        });
                    }
                }
            })
            
        }else{
            
        }
     
    }
    Room.remoteMethod(
        'create_room',{
            accepts: [
                {arg: 'user_id', type: 'string'},
                {arg: 'room_type', type: 'string'},
                {arg: 'room_name', type: 'string'},
                {arg: 'users_to_chat', type: 'string'},
            ],
            returns: [
                {arg: 'status', type: 'number'},
                {arg: 'message', type: 'string'},
                {arg: 'data', type: 'array'},
            ]
        }
    );
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    Room.respond_chat_request = function( user_id, room_id, accept, callback ){
        where = {
            '_id' : GENERIC.get_mongo_objectid( room_id )
        }
        Room.find({where : where}, function( err, result ){
            if( err ){
                callback(null, 0, 'Some Error Occurs', {} );
            }else{
                if( result.length == 0 ){
                    callback(null, 0, 'Room not found', {} );
                }else{
                    result = result[0];
                    var request_to = result['request_to'];
                    if( request_to != user_id ){
                        callback(null, 0, 'Room found Invalid User', {} );
                    }else{
                        Room.update( {'_id' : GENERIC.get_mongo_objectid( room_id )},{
                            request_accepted: 1,
                        }, function (err, result ){
                            if( err ){
                               console.log( err );
                                callback(null, 0, 'error occurs while updating', {} );
                            }else{
                                callback(null, 1, 'Done', {} );
                            }
                        });
                    }
                }
            }
        });
    }
    Room.remoteMethod(
        'respond_chat_request',{
            accepts: [
                {arg: 'user_id', type: 'string'},
                {arg: 'room_id', type: 'string'},
                {arg: 'accept', type: 'number'},
            ],
            returns: [
                {arg: 'status', type: 'number'},
                {arg: 'message', type: 'string'},
                {arg: 'data', type: 'array'},
            ]
        }
    );
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    
};
