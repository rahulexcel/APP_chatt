//var Room = require('../models/room');
//var User = require('../models/user');

//var loopback = require('loopback');
//var app = module.exports = loopback();
//
////console.log( app.models.Room );
//for( var k in app.models ){
//    console.log(k);
//}

//console.log( Room.apps );


module.exports = {

  create_private_room: function(app, io, a, b, c ,d){
      
      console.log( app.models );
      
      console.log('create room ')      ;
      //console.log( app._events.request);
      //console.log( Room.toString() );
      
      //console.log( io );
      
      Room.find( {'arun':'2466'}, function (err, result) {
          
          console.log( result );
          
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
                                    room_owner : new ObjectID( owner_user_id ),
                                    room_users : room_users,
                                    registration_time: currentTimestamp,
                                    registration_date: UTIL.currentDate(currentTimestamp),
                                    registration_date_time: UTIL.currentDateTimeDay(currentTimestamp)
                                });
                                new_room.save( function(err){
                                    if( err ){
                                        callback(null, 0, 'try again', {});
                                    }else{
                                        var room_id = new_room.id;
                                        var data = {
                                            'room_id' : room_id
                                        };
                                        callback(null, 1, 'Chat Room Created', data);
                                    }
                                });
                            }
                        }
                    });
      
      
      
      
      
      
//    var query = {roomid: roomid};
//    if(io.sockets.connected[socket_id] != undefined){
//      Room.findOneAndUpdate(query, {"$addToSet": {online_sockets: socket_id}}, function(err){
//        if(err)
//          throw(err);
//      });
//    }
  }


  

};
