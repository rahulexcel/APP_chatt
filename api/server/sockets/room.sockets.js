module.exports = {
    chat_message : function( param_models, authToken, room_id, message, callback){
        var Room = param_models.Room;
        var User = param_models.User;
        var new_room = new Room({
            'arun' :'kumar'
        });
        new_room.save( function(err){
            if( err ){
                //callback(null, 0, 'try again', {});
            }else{
                var room_id = new_room.id;
                var data = {
                    'room_id' : room_id
                };
                //callback(null, 1, 'Chat Room Created', data);
                console.log( data );
            }
        });
        
        
        //callback();
        
        
        
        
    }
};
