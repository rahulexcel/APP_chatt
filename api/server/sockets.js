var socketio = require('socket.io');

var room_socket_handler = require('./sockets/room.sockets.js');

module.exports.listen = function(app){
    
    io = socketio.listen(app);
    io.on('connection', function(socket){
        console.log('a user connected');
        socket.on('chat message', function(msg){
            console.log('message: ' + msg);
            
            //onsole.log( Room );
            
            
            //console.log( app );
            
            room_socket_handler.create_private_room(app, io, 'req','roomid','message',function(){
                io.emit('chat message', msg);
            });
            
        });
    });
    
    
    return io;
}

