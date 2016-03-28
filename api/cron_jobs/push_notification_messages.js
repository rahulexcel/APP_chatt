var models = require('../server/server.js').models;
var UTIL = require('../server/modules/generic');
var Room = models.room;
var Message = models.message;
var ObjectID = require('mongodb').ObjectID;

var server_time = UTIL.currentTimestamp();

var gcm = require('node-gcm');
var sender = new gcm.Sender('AIzaSyDluTER917Kc6usic9OaHWw3rEXdG3_gTg');

function PUSH_MESSAGE( regTokens, msg_info, cb ){
    var message = new gcm.Message({
        priority: 'high',
        data: {
            room_id: msg_info.room_id
        },
        notification: {
            title: msg_info.message_owner_name,
            icon: msg_info.message_profile_image,
            body: msg_info.message_body
        }
    });
    //var regTokens = ['eITyCj0Woyo:APA91bFWmYlMXyRdjo7GvBG2pJpQfuxFtC3UXh2ebI2kzVxXDo_vk0Jc2b30PDwixutMUJK7TRXtZn4vALTzFawQmy0IxHfZWkrXBSm3-ELjlsM2T0T8Sz9RybwLIt58PYHaCZEBwusd'];
    sender.send( message, { registrationTokens: regTokens }, function (err, response) {
        if(err){
            cb( false, err );
        }else{
            if( response.success == 1 ){
                cb( true, response );
            }else{
                cb( false, response );
            }
        } 
    });
}

function update_message_push_status( message_id, status, callback ){
    console.log('update status : ' + message_id +' :: ' + status );
    Message.update({
        _id : new ObjectID( message_id )
    },{
        'push_notification_status': 1*1
    },function (err, result2) {
        if (err) {
            callback();
        } else {
            callback();
        }
    });
}

function push_room_message( message_id, message_owner_id, room_id, p_message, callback ){
    Room.find({
        "where": {
            '_id' : new ObjectID( room_id )
        },
        "include": [{
            relation: 'room_users'
        }]
    },function (err, results) {
        if( err ){
            console.log(err);
        }else{
            var TOKENS = [];
            var msg_by_name = msg_by_profile_image = '';
            results.forEach(function(result) {
                room_info = result.toJSON();
                room_users = room_info.room_users;
                for( var k in room_users ){
                    var room_user_id = room_users[k].id;
                    if( room_user_id.toString() != message_owner_id.toString() ){
                        var user_tokens = room_users[k].token;
                        if( user_tokens  != ''){
                            TOKENS.push( user_tokens );
                        }
                    }else{
                        msg_by_name = room_users[k].name;
                        msg_by_profile_image = room_users[k].profile_image;
                    }
                }
            });
            if( TOKENS.length == 0 ){
                callback('Empty gcm tokens');
            }else{
                var push_msg_info = {
                    'room_id' : room_id,
                    'message_owner_name' : msg_by_name,
                    'message_profile_image' : msg_by_profile_image,
                    'message_type' : p_message.type,
                    'message_body' : p_message.body,
                };
                console.log( push_msg_info );
                PUSH_MESSAGE( TOKENS, push_msg_info, function( push_msg_status, push_msg_response ){
                    if( push_msg_status == false ){
                        update_message_push_status( message_id, 0, function(){
                            callback( push_msg_status, push_msg_response);
                        });
                    }else{
                        update_message_push_status( message_id, 1, function(){
                            callback( push_msg_status, push_msg_response);
                        });
                    }
                });
            }
        }
    })
}
function start_pushing( DATA, callback ){
    if( DATA.length == 0 ){
        callback();
    }else{
        var push_data = DATA[0];
        DATA.shift();
        p_message_id = push_data.message_id;
        p_room_id = push_data.room_id;
        p_message_owner = push_data.message_owner;
        p_message = push_data.message;
        push_room_message( p_message_id, p_message_owner, p_room_id, p_message, function( status, status_response ){
            console.log( p_message_id );
            console.log( status_response );
            console.log('-------------------------------------------------------------');
            start_pushing( DATA, callback );
        });
    }
}
function START(){
    var check_time_old = 60*5;
    var server_time = UTIL.currentTimestamp();
    var check_time = server_time - check_time_old;
    console.log( server_time );
    console.log( check_time );
    console.log('*****************************************************');
    console.log('***********************START*************************');
    console.log('*****************************************************');
    Message.find( {
            "where" : {
                'message_status' : 'sent',
//                'message_time' : {
//                    'lte' : check_time
//                },
                '$or' : [{
                    'push_notification_status' : { '$exists' : false },
                },{
                    'push_notification_status' : 0*1
                }]
            }
        }, function (err, results) {
        if( err ){
            console.log( err );
            console.log('error hai');
        }else{
            PUSH_DATA = [];
            for( var k in results ){
                m = results[k].toJSON();
                row = {
                    'message_id' : m.id,
                    'room_id' : m.room_id,
                    'message_owner' : m.message_owner,
                    'message' : m.message
                }
                PUSH_DATA.push( row );
            }
            console.log( 'Pending for push messages :: ' + PUSH_DATA.length );
            console.log('___________________________________________________');
            if( PUSH_DATA.length > 0 ){
                start_pushing( PUSH_DATA, function(){
                    setTimeout( START, 30000 );
                });
            }else{
                setTimeout( START, 30000 );
            }
        }
    });
    
}


START();




//Message.find( function (err, results) {
//    if( err ){
//        console.log( err );
//        console.log('error hai');
//    }else{
//        for( var k in results ){
//            m = results[k].toJSON();
//            row = {
//                'message_id' : m.id,
//                'room_id' : m.room_id,
//                'message_owner' : m.message_owner,
//                'message' : m.message
//            }
//            PUSH_DATA.push( row );
//        }
//        
//        start_pushing( );
//        
//        
        //console.log( PUSH_DATA );
        
//        results.forEach(function(result) {
//            // post.owner points to the relation method instead of the owner instance
//            var p = result.toJSON();
//            //var p = result;
//            console.log( p );
//            
//            console.log( p.room_id );
//            
//            
//            
//            //console.log( p.room_id.room_users );
//            
//            
//            //console.log( p.room_id.toJSON() );
//            
//            //var p_room_users = p.room_id;
//            
//            //console.log( p_room_users );
//            
//            //p_room_users.forEach( function(ress ){
//                //pp = ress.toJSON();
//                //console.log( pp );
//            //})
//            
//            //console.log( p.room_id.room_users);
//            //console.log( p.room_id.room_users);
//            
//            //p_room_users.forEach( function(rre){
//                //console.log( rre ); 
//            //})
//            
//            //console.log( result.room_id );
//            //console.log( p.room_id );
//            
//            
//            
//            //console.log(p.owner.posts, p.owner.orders);
//        });
        
        
        
        
        
        //for( var k in result ){
//            kk = result[k];
//            r_u = kk['room_id'];
//            console.log( kk );
//            console.log('-----');
//            console.log( kk['room_id'] );
//            console.log('-----');
//            console.log( kk['room_id'].toJSON() ) ;
//            
//            //for( var k in r_u ){
//                //console.log(r_u[k][0].toJson());
//            //}
//            
//            console.log( r_u.length );
//            
//            console.log( kk.toJson() );
            
            //console.log( kk['room_id'][0].toJson() );
            
            //console.log( r_u.toJSON() );
            //console.log('-----');
            
            //console.log( JSON.parse(JSON.stringify( r_u ) ) );
            
            //r_u.filter(function(uu){
                //console.log( uu );
            //})
            
            
//            Room.find( {
//                'where':{
//                    '_id' : new ObjectID( kk.room_id )
//                }
//            }, function(err1, result1 ){
//                console.log( err1 );
//                console.log( result1 );
//            })
        //}
        //console.log( result );
        //console.log( result.room_id );
    //}
    
//});


//console.log( Room );
