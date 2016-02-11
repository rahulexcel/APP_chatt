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
                                    var data = {
                                        user_id : result.id,
                                    }
                                    callback(null, 1, 'Success login', data );
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
                                    data['show_verification'] = 1;
                                    User.app.models.email.send_email( 'new_registration', { email : email_id, name : name, verification_code : verification_code }, function(){
                                        callback(null, 1, 'Successful Registration', data );
                                    });
                                }
                            });
                        });
                    }
                }
//                else if( action == "login" ){
//                    if( result.length == 0 ){
//                        callback(null, 0, 'Email id not exists', {} );
//                    }else{
//                        result = result[0];
//                        if( action_type == 'manual' ){
//                            verification_status = result['verification_status'];
//                            if( verification_status == 0 ){
//                                callback(null, 0, 'Please verify your account first', {} );
//                            }else{
//                                exist_password = result['password'];
//                                GENERIC.match_encode_password( password, exist_password,  function( check ){
//                                    if( check == false  ){
//                                        callback(null, 0, 'Invalid login', {} );
//                                    }else{
//                                        var data = {
//                                            user_id : result.id,
//                                        }
//                                        callback(null, 1, 'Success login', data );
//                                    }
//                                });
//                            }
//                        }else{
//                            
//                        }
//                    }
//                }else{
//                    //this means action=register
//                    if( result.length != 0 ){
//                        callback(null, 0, 'Email Id Already Exists', {} );
//                    }else{
//                        GENERIC.encode_password( password, function( hash_password ){
//                            
//                        });
//                    }
//                }
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
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    User.do_user_verification = function( email_id, code, callback ){
        email_id = email_id.toLowerCase();
        where = {
            email_id : email_id
        };
        User.find( {where: where} , function( err, result ){
            if( err ){
                callback(null, 0, 'Some error occurs', {} );
            }else{
                if( result.length == 0 ){
                    callback(null, 0, 'Email Id not exists', {} );
                }else{
                    result = result[0];
                    verification_status = result['verification_status'];
                    exist_code = result['verification_code'];
                    if( verification_status == 1 ){
                        callback(null, 0, 'Already verified.', {} );
                    }else if( exist_code !=  code ){
                        callback(null, 0, 'Verification failed.', {} );
                    }else{
                        User.update( {email_id : email_id},{
                            verification_status: 1,
                            verification_code : ''
                        }, function (err, result ){
                            if( err ){
                                callback(null, 0, 'Some error occurs', {} );
                            }else{
                                callback(null, 1, 'Verified!! You can login now', {} );
                            }
                        });
                    }
                }
            }
        })
    }
    User.remoteMethod(
        'do_user_verification',{
            accepts: [
                {arg: 'email', type: 'string'},
                {arg: 'code', type: 'string'},
            ],
            returns: [
                {arg: 'status', type: 'number'},
                {arg: 'message', type: 'string'},
                {arg: 'data', type: 'array'},
            ]
        }
    );
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    User.resend_verification_code = function( email_id, callback ){
        email_id = email_id.toLowerCase();
        where = {
            email_id : email_id
        };
        User.find( {where: where} , function( err, result ){
            if( err ){
                callback(null, 0, 'Some error occurs', {} );
            }else{
                if( result.length == 0 ){
                    callback(null, 0, 'Email Id not exists', {} );
                }else{
                    result = result[0];
                    verification_status = result['verification_status'];
                    if( verification_status == 1 ){
                        callback(null, 0, 'Already verified.', {} );
                    }else{
                        new_verification_code = GENERIC.get_random_number();
                        new_verification_code = new_verification_code.toString();
                        User.update( {email_id : email_id},{
                            verification_code: new_verification_code,
                        }, function (err, result ){
                            if( err ){
                                callback(null, 0, 'Some error occurs', {} );
                            }else{
                                User.app.models.email.send_email( 'resend_verification_code', { email : email_id, verification_code : new_verification_code }, function(){
                                    callback(null, 1, 'Check your email for new verification code', {} );
                                });
                            }
                        });
                    }
                }
            }
        })
    }
    User.remoteMethod(
        'resend_verification_code',{
            accepts: [
                {arg: 'email', type: 'string'},
            ],
            returns: [
                {arg: 'status', type: 'number'},
                {arg: 'message', type: 'string'},
                {arg: 'data', type: 'array'},
            ]
        }
    );
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    User.reset_password = function( email_id, callback ){
        email_id = email_id.toLowerCase();
        where = {
            email_id : email_id
        };
        User.find( {where: where} , function( err, result ){
            if( err ){
                callback(null, 0, 'Some error occurs', {} );
            }else{
                if( result.length == 0 ){
                    callback(null, 0, 'Email Id not exists', {} );
                }else{
                    result = result[0];
                    verification_status = result['verification_status'];
                    if( verification_status == 0 ){
                        callback(null, 0, 'Please verify your account first.', {} );
                    }else{
                        new_password = GENERIC.get_random_number();
                        new_password = new_password.toString();
                        GENERIC.encode_password( new_password, function( hash_password ){
                            User.update( {email_id : email_id},{
                                password : hash_password,
                            }, function (err, result ){
                                if( err ){
                                    callback(null, 0, 'Some error occurs', {} );
                                }else{
                                    User.app.models.email.send_email( 'resend_password', { email :  email_id, new_password : new_password }, function(){
                                        callback(null, 1, 'Check your email for new password', {} );
                                    });
                                    
                                    
//                                    User.app.models.email.send({
//                                        to: 'arun@excellencetechnologies.in',
//                                        from: 'exceltes@gmail.com',
//                                        subject: 'First Chatt Api Email',
//                                        text: 'Test Chatt',
//                                        html: 'my <em>html</em>'
//                                    }, function(err, mail) {
//                                        console.log('email sent!');
                                       // callback(null, 1, 'Check your email for new password', {} );
//                                    });
                                }
                            });
                        });
                    }
                }
            }
        })
    }
    User.remoteMethod(
        'reset_password',{
            accepts: [
                {arg: 'email', type: 'string'}
            ],
            returns: [
                {arg: 'status', type: 'number'},
                {arg: 'message', type: 'string'},
                {arg: 'data', type: 'array'},
            ]
        }
    );
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    User.users_list = function( page_number, callback ){
        page_limit = 1;
        if( typeof page_number == 'undefined' || page_number == '' ){
            page_number = 1;
        }
        page_number = page_number - 1;
        skip_count = page_number * page_limit;
        where = {
            verification_status : 1
        };
        User.find( {where : where, skip : skip_count ,limit : page_limit } ,function( err, result ){
            if( err ){
                callback(null, 0, 'Some error occurs', {} );
            }else{
                if( result.length == 0 ){
                    callback(null, 0, 'No user found', {} );
                }else{
                    var new_results = [];
                    for( var k in result ){
                        var row = result[k];
                        modify_row  = GENERIC.get_user_public_view( row );
                        new_results.push( modify_row );
                    }
                    callback(null, 1, 'Users found', { users : new_results } );
                }
            }
        });
    }
    User.remoteMethod(
            'users_list',{
                accepts: [
                  { arg : 'page_number', type : 'number' }
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'},
                ]
            }
    );
    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
};