var socketio = require('socket.io');

//var room_socket_handler = require('./sockets/room.sockets.js');

module.exports.listen = function(app){
    
    var Room = app._events.request.models.Room;
    var User = app._events.request.models.User;
    
    var param_models = {
        'Room' : Room,
        'User' : User
    };
    
    io = socketio.listen(app);
    io.on('connection', function(socket){
        console.log('a user connected');
        socket.on('chat_message', function(msg){
            console.log('message: ' + msg);
            //room_socket_handler.chat_message( param_models, 'authtoken', 'room_id','message',function(){
                //io.emit('chat_message', msg);
            //});
            Room.chat_message( 'acctoken', 'toom_id', 'msg', function(aa){
                //console.log(aa);
            })
//            
        });
    });
    
    
    return io;
}

