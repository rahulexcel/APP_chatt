var socketio = require('socket.io');

module.exports.listen = function(app){
    var Room = app._events.request.models.Room;
    var User = app._events.request.models.User;
    
    
    function list_my_rooms( accessToken, room_type, currentTimestamp, callback ){
        Room.list_my_rooms( accessToken, room_type, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
            var response = {
                'status' : res_status,
                'message' : res_message,
                'data' : res_data
            };
            callback( response );
        });
    }
    function create_room( accessToken, room_type, chat_with, room_name, room_description, currentTimestamp, callback ){
        Room.create_room( accessToken, room_type, chat_with, room_name, room_description, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
            var response = {
                'status' : res_status,
                'message' : res_message,
                'data' : res_data
            };
            callback( response );
        });
    }
    function FN_join_public_room( accessToken, room_id, currentTimestamp, callback ){
        Room.join_public_room( accessToken, room_id, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
            var response = {
                'status' : res_status,
                'message' : res_message,
                'data' : res_data
            };
            callback( response );
        })
    }
    function FN_leave_public_group( accessToken, room_id, currentTimestamp, callback ){
        Room.leave_public_group( accessToken, room_id, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
            var response = {
                'status' : res_status,
                'message' : res_message,
                'data' : res_data
            };
            callback( response );
        })
    }
    function FN_remove_public_room_member( accessToken, room_id, user_id, currentTimestamp, callback ){
        Room.remove_public_room_member( accessToken, room_id, user_id, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
            var response = {
                'status' : res_status,
                'message' : res_message,
                'data' : res_data
            };
            callback( response );
        })
    }
    function FN_room_message( msg_local_id, accessToken, room_id, message_type, message, currentTimestamp, callback ){
        Room.room_message( msg_local_id, accessToken, room_id, message_type, message, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
            var broadcast_data = {};
            var user_data = {};
            if( res_status == 1 ){
                var broadcast_data = {
                    'room_id' : room_id,
                    'message_id' : res_data.message_id,
                    'message_status' : res_data.message_status,
                    'name' : res_data.name,
                    'profile_image' : res_data.profile_image,
                    'message_type' : res_data.message.type,
                    'message_body' : res_data.message.body,
                    'message_time' : res_data.message_time,
                };
                var user_data = {
                    'msg_local_id' : res_data.msg_local_id,
                    'room_id' : room_id,
                    'message_id' : res_data.message_id,
                    'message_status' : res_data.message_status,
                    'message_time' : res_data.message_time,
                };
            }
            var response = {
                'status' : res_status,
                'message' : res_message,
                'data' : {
                    'broadcast_data' : broadcast_data,
                    'user_data' : user_data
                }
            };
            callback( response );
        })
    }
    
    
    
    io = socketio.listen(app);
    io.on('connection', function(socket){
        console.log('a user connected');
        
        socket.on( 'create_room', function( accessToken, room_type, chat_with, room_name, room_description, currentTimestamp ){
            create_room( accessToken, room_type, chat_with, room_name, room_description, currentTimestamp, function( response ){
                socket.emit( 'new_private_room', response );
                if( response.status == 1 ){
                    list_my_rooms( accessToken, room_type, currentTimestamp, function( response_1 ){
                        socket.emit( 'show_my_rooms', response_1 );
                    });
                }
            });
        });  
        
        socket.on('list_my_rooms', function( accessToken, currentTimestamp ){
            list_my_rooms( accessToken, currentTimestamp, function( response ){
                socket.emit( 'show_my_rooms', response );
            });
        });
        
        //room_open means whenever a room is open in app/ will also be called when a room is created.
        socket.on('room_open', function( room_id ){
            console.log(' A Room is opened with id :  '+ room_id );
            var join_room = true;
            if( typeof io.sockets.adapter.rooms[room_id] != 'undefined' ){
                if( typeof io.sockets.adapter.rooms[room_id].sockets != 'undefined'){
                    var exist_sockets = io.sockets.adapter.rooms[room_id].sockets;
                    var user_socket_id = socket.id;
                    for( var k in exist_sockets ){
                        if( k == user_socket_id ){
                            join_room = false;
                        }
                    }
                }
            }
            if( join_room == true ){
                console.log( '--- Room is in Socket JOIN');
                socket.join( room_id );
            }
        });
        
        //when room users view a message, update message_status to seen
        socket.on('update_message_status', function(accessToken, room_id, message_id, status, currentTimestamp ){
            Room.update_message_status( accessToken, room_id, message_id, status, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
                if( res_status == 1 ){
                    socket.to( room_id ).emit( 'response_update_message_status', res_data );
                }
            })
        });
        
        //join public room 
        socket.on('join_public_room', function( accessToken, room_id, currentTimestamp ){
            FN_join_public_room( accessToken, room_id, currentTimestamp, function( response ){
                if( response.status == 1 ){
                    var d = {
                        type : 'alert',
                        data : response
                    }
                    socket.emit( 'RESPONSE_join_public_room', d );
                    socket.to( room_id ).emit( 'response_room', d ); // this is not using yet
                }
            });
        })
        
        //get_user_profile
        socket.on('get_user_profile_for_room', function( accessToken, room_id, user_id, currentTimestamp ){
            User.get_user_profile( accessToken, user_id, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
                console.log( res_message );
                console.log( res_data)
                if( res_status == 1 ){
                    var d = {
                        type : 'info',
                        room_id : room_id,
                        user_id : user_id,
                        data : res_data
                    }
                    socket.emit( 'RESPONSE_get_user_profile_for_room', d );
                }
            })
        });
        
        //sockets events ( trying to create generic )
        socket.on('APP_SOCKET_EMIT',function( type, info ){
            if( type == 'room_message' ){
                var msg_local_id = info.msg_local_id;
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var message_type = info.message_type;
                var message = info.message;
                var currentTimestamp = info.currentTimestamp;
                FN_room_message( msg_local_id, accessToken, room_id, message_type, message, currentTimestamp, function( response ){
                    if( response.status == 1 ){
                        // will be available on other users of room
                        var d1 = {
                            type : 'alert',
                            data : response.data.broadcast_data
                        }
                        socket.to( room_id ).emit( 'RESPONSE_APP_SOCKET_EMIT','new_room_message', d1 );
                        // will have status of message sent by user
                        var d2 = {
                            type : 'alert',
                            data : response.data.user_data
                        }
                        socket.emit( 'RESPONSE_APP_SOCKET_EMIT','sent_message_response', d2 );
                    }
                });
            }
            else if( type == 'leave_public_group' ){
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var currentTimestamp = info.currentTimestamp;
                FN_leave_public_group( accessToken, room_id, currentTimestamp, function( response ){
                    var d = {
                        type : 'alert',
                        data : response
                    }
                    socket.emit( 'RESPONSE_APP_SOCKET_EMIT', 'leave_public_group', d );
                    //socket.to( room_id ).emit( 'RESPONSE_APP_SOCKET_EMIT', 'left_public_group',d ); // this is for others users to show msg if they are online they will get this
                });
            }
            else if( type == 'remove_public_room_member' ){
                var accessToken = info.accessToken;
                var room_id = info.room_id;
                var user_id = info.user_id;
                var currentTimestamp = info.currentTimestamp;
                FN_remove_public_room_member( accessToken, room_id, user_id, currentTimestamp, function( response ){
                    var d = {
                        type : 'alert',
                        data : response
                    }
                    socket.emit( 'RESPONSE_APP_SOCKET_EMIT', 'remove_public_room_member', d ); // to the admin who removed the message
                    //socket.to( room_id ).emit( 'RESPONSE_APP_SOCKET_EMIT', 'remove_public_room_member',d ); // this is for others users to show msg if they are online they will get this
                });
            }
        });
        
    });
    //return io;
}

