var GENERIC = require('../modules/generic');

module.exports = function(User) {
User.register_login = function( action, action_type, social_id, platform, device_id, token, email_id, name, password, callback ){
        name = name.toLowerCase();
        email_id = email_id.toLowerCase();
        where = {
            email_id : email_id
        };
        User.find( {where: where} , function( err, result ){
            if( err ){
                callback(null, 0, 'Some Error Occurs', {} );
            }else{
                if( action == 'login_register'){
                    if( result.length > 0 ){
                        result = result[0];
                        
                        var r_verification_status = result.verification_status;
                        
                        if( action_type == 'facebook' || action_type == 'google' ){
                            var data = {
                                user_id : result.id,
                            }
                            callback(null, 1, 'Success login', data );
                        }else if( action_type == 'manual_register'){
                            callback(null, 0, 'Email id already exists.', data );
                        }else if( action_type == 'manual_login' ){
                            var exist_password = result.password;
                            GENERIC.match_encode_password( password, exist_password ,function( check ){
                                if( check == true ){
                                    if( r_verification_status == 0 ){
                                        callback(null, 0, 'Please verify you account first', {} );
                                    }else{
                                        var data = {
                                            user_id : result.id,
                                        }
                                        callback(null, 1, 'Success login', data );
                                    }
                                }else{
                                    callback(null, 0, 'Invalid Login', data );
                                }
                            })
                        }
                    }else{
                        if( action_type == "facebook" || action_type == 'google' ){
                            password = GENERIC.get_random_number();
                        }
                        password = password.toString();
                        GENERIC.encode_password( password, function( hash_password ){
                            var verification_status = 0;
                            var verification_code = GENERIC.get_random_number();
                            verification_code = verification_code.toString();
                            if( action_type == 'facebook' || action_type == 'google' ){
                                verification_status = 1;
                                verification_code = '';
                            }
                            var newUser = new User({
                                verification_status : verification_status,
                                verification_code : verification_code,
                                registration_type : action_type,
                                social_id : social_id,
                                platform : platform,
                                device_id : device_id,
                                token : token,
                                email_id : email_id,
                                name : name,
                                password : hash_password,
                                last_seen : '',
                                registration_time : GENERIC.currentTimestamp(),
                                registration_date : GENERIC.currentDate(),
                                registration_date_time : GENERIC.currentDateTimeDay(),
                                profile_image : ''
                            });
                            newUser.save( function( err, result ){
                                if( err ){
                                    callback(null, 0, 'Some Error Occurs', {} );
                                }else{
                                    var user_id = result.id;
                                    var data = {
                                        user_id : user_id,
                                    }
                                    if( action_type != 'facebook' && action_type != 'google' ){
                                        data['show_verification'] = 1;
                                    }
                                    User.app.models.email.send_email( 'new_registration', { email : email_id, name : name, verification_code : verification_code }, function(){
                                        callback(null, 1, 'Successful Registration', data );
                                    });
                                }
                            });
                        });
                    }
                }
            }
        })
    }
    User.remoteMethod(
        'register_login',{
            accepts: [
                {arg: 'action', type: 'string'},
                {arg: 'action_type', type: 'string'},
                {arg: 'social_id', type: 'string' },
                {arg: 'platform', type: 'string'},
                {arg: 'device_id', type: 'string'},
                {arg: 'token', type: 'string'},
                {arg: 'email', type: 'string'},
                {arg: 'name', type: 'string'},
                {arg: 'password', type: 'string'},
            ],
            returns: [
                {arg: 'status', type: 'number'},
                {arg: 'message', type: 'string'},
                {arg: 'data', type: 'array'},
            ]
        }
    );
};
