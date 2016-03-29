var gcm = require('node-gcm');
var CONFIG = require('../config.json');

var sender = new gcm.Sender( CONFIG.CONFIG_gcm_sender_id );
module.exports = {
    PUSH_MESSAGE: function ( regTokens, msg_info, cb ) {
        console.log( msg_info );
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
            console.log( response );
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
}