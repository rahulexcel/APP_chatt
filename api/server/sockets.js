var socketio = require('socket.io');

module.exports.listen = function(app){
    var Room = app._events.request.models.Room;
    var User = app._events.request.models.User;
    
    io = socketio.listen(app);
    io.on('connection', function(socket){
        console.log('a user connected');
        socket.on('create_room_message', function( accessToken, room_id, message, currentTimestamp ){
            console.log('message: ' + message);
            Room.create_room_message( accessToken, room_id, message, currentTimestamp, function( ignore_param, res_status, res_message, res_data ){
                console.log( res_status );
                console.log( res_message );
                console.log( res_data );
            })
        });
    });
    //return io;
}

