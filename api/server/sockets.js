var socketio = require('socket.io');

module.exports.listen = function(app){
    var Room = app._events.request.models.Room;
    var User = app._events.request.models.User;
    
    
    function list_my_rooms( accessToken, currentTimestamp, callback ){
        Room.list_my_rooms( accessToken, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
            var response = {
                'status' : res_status,
                'message' : res_message,
                'data' : res_data
            };
            callback( response );
        });
    }
    function create_private_room( accessToken, chat_with, currentTimestamp, callback ){
        Room.create_private_room( accessToken, chat_with, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
            var response = {
                'status' : res_status,
                'message' : res_message,
                'data' : res_data
            };
            callback( response );
        });
    }
    
    
    io = socketio.listen(app);
    io.on('connection', function(socket){
        console.log('a user connected');
        
        socket.on( 'create_private_room', function( accessToken, chat_with, currentTimestamp ){
            create_private_room( accessToken, chat_with, currentTimestamp, function( response ){
                socket.emit( 'new_private_room', response );
                if( response.status == 1 ){
                    list_my_rooms( accessToken, currentTimestamp, function( response_1 ){
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
        
        socket.on('room_message', function( accessToken, room_id, message, currentTimestamp ){
            socket.join( room_id );
            console.log('message: ' + message);
            Room.room_message( accessToken, room_id, message, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
                if( res_status == 1 ){
                    var data = {
                        'name' : 'msg_from_name',
                        'image' : 'msg_from_image',
                        'message' : message
                    };
                    socket.to( room_id ).emit( 'new_room_message', data );
                }
            })
        });
    });
    //return io;
}

