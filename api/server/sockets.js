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
        
        socket.on('room_message', function( msg_local_id, accessToken, room_id, message, currentTimestamp ){
            console.log('message: ' + message);
            Room.room_message( msg_local_id, accessToken, room_id, message, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
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
                    console.log( broadcast_data );
                    // will be available on other users of room
                    socket.to( room_id ).emit( 'new_room_message', broadcast_data );
                    
                    var user_data = {
                        'msg_local_id' : res_data.msg_local_id,
                        'room_id' : room_id,
                        'message_id' : res_data.message_id,
                        'message_status' : res_data.message_status,
                        'message_time' : res_data.message_time,
                    };
                    
                    // will have status of message sent by user
                    socket.emit( 'sent_message_response', user_data );
                }
            })
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
                    socket.to( room_id ).emit( 'response_room', d );
                }
            });
        })
        
    });
    //return io;
}

