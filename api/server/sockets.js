var socketio = require('socket.io');

module.exports.listen = function(app){
    var Room = app._events.request.models.Room;
    var User = app._events.request.models.User;
    
    io = socketio.listen(app);
    io.on('connection', function(socket){
        console.log('a user connected');
        
        socket.on( 'create_private_room', function( accessToken, chat_with, currentTimestamp ){
            Room.create_private_room( accessToken, chat_with, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
                var response = {
                    'status' : res_status,
                    'message' : res_message,
                    'data' : res_data
                };
                socket.emit( 'new_private_room', response );
            })
        });    
        
        socket.on('room_message', function( accessToken, room_id, message, currentTimestamp ){
            socket.join( room_id );
            console.log('message: ' + message);
            Room.room_message( accessToken, room_id, message, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
                console.log( res_status );
                console.log( res_message );
                console.log( res_data );
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

