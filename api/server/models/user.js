var UTIL = require('../modules/generic');
var lodash = require('lodash');
var moment = require('moment');
var generatePassword = require('password-generator');

module.exports = function (User) {
    //********************************* START REGISTER AND LOGIN **********************************
    User.register_login = function (action, action_type, social_id, platform, device_id, token, email_id, name, password, currentTimestamp, callback) {
        if (action && action_type && email_id) {
            if( typeof name == 'undefined' || name == ''){
                name = '';
            }else{
                name = name.toLowerCase();
            }
            email_id = email_id.toLowerCase();
            where = {
                email : email_id
            };
            User.find({where: where}, function (err, result) {
                if (err) {
                    callback(null, 0, err, {});
                } else {
                    if (action == 'login_register') {
                        var resultSize = lodash.size(result);
                        if (resultSize > 0) {
                            result = result[0];
                            var r_verification_status = result.verification_status;
                            if (action_type == 'manual_register') {
                                callback(null, 0, 'Email id already exists.', {});
                            } else if (action_type == 'manual_login' || action_type == 'facebook' || action_type == 'google') {
                                if (action_type == 'facebook' || action_type == 'google') {
                                    result.createAccessToken(86400, function(err, accessToken) {
                                        if (err){
                                            callback(null, 0, 'Invalid login', {});
                                        }else{
                                            var data = {
                                                user_id: accessToken.userId,
                                                access_token : accessToken.id
                                            };
                                            callback(null, 1, 'Success login', data);
                                        }
                                    });
                                }else{
                                    if (r_verification_status == 0) {
                                        callback(null, 3, 'Please verify you account first', {});
                                    } else {
                                        //-START--get access token---------
                                        User.login({
                                            email:email_id,
                                            password : password
                                        },function( err, accessToken ){
                                            if( err ){
                                                callback(null, 0, 'Invalid login', {});
                                            }else{
                                                var data = {
                                                    user_id: result.id,
                                                    access_token : accessToken.id
                                                };
                                                callback(null, 1, 'Success login', data);
                                            }
                                        })
                                        //-END----get access token---------
                                    }
                                }
                            }
                        } else {
                            if( action_type == 'manual_login'){
                                callback(null, 0, 'Email id not exists', {});
                            }else if( name == '' ){
                                callback(null, 0, 'Name required', {});
                            }else if( action_type != 'facebook' && action_type != 'google' && ( typeof password =='undefined' || password == '') ){
                                callback(null, 0, 'Password required', {});
                            }else{
                                var verification_status = 0;
                                var verification_code = UTIL.get_random_number();
                                verification_code = verification_code.toString();
                                if (action_type == 'facebook' || action_type == 'google') {
                                    verification_status = 1;
                                    verification_code = '';
                                }
                                User.create({
                                    verification_status: verification_status,
                                    verification_code: verification_code,
                                    registration_type: action_type,
                                    social_id: social_id,
                                    platform: platform,
                                    device_id: device_id,
                                    token: token,
                                    email: email_id,
                                    name: name,
                                    password: password,
                                    last_seen: '',
                                    registration_time: currentTimestamp,
                                    registration_date: UTIL.currentDate(currentTimestamp),
                                    registration_date_time: UTIL.currentDateTimeDay(currentTimestamp),
                                    profile_image: ''
                                },function( err, user ){
                                    if (err) {
                                        callback(null, 0, err, {});
                                    } else {
                                        var user_id = user.id;
                                        var data = {
                                            user_id: user_id
                                        };
                                        if (action_type != 'facebook' && action_type != 'google') {
                                            data['show_verification'] = 1;
                                        }
                                        User.app.models.email.newRegisteration({email: email_id, name: name, verification_code: verification_code}, function () {
                                            callback(null, 1, 'Successful Registration', data);
                                        });
                                    }
                                })
                            }
                        }
                    }
                }
            });
        }
        else {
            callback(null, 0, 'Fill All fileds', {});
        }
    };
    User.remoteMethod(
            'register_login', {
                accepts: [
                    {arg: 'action', type: 'string'},
                    {arg: 'action_type', type: 'string'},
                    {arg: 'social_id', type: 'string'},
                    {arg: 'platform', type: 'string'},
                    {arg: 'device_id', type: 'string'},
                    {arg: 'token', type: 'string'},
                    {arg: 'email', type: 'string'},
                    {arg: 'name', type: 'string'},
                    {arg: 'password', type: 'string'},
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ]
            }
    );
//********************************* END REGISTER AND LOGIN ************************************    

//********************************* START USER VERIFICATIION **********************************
    User.do_user_verification = function (email_id, code, callback) {
        email_id = email_id.toLowerCase();
        where = {
            email: email_id
        };
        User.find({where: where}, function (err, result) {
            if (err) {
                callback(null, 0, err, {});
            } else {
                if (result.length == 0) {
                    callback(null, 0, 'Email Id not exists', {});
                } else {
                    result = result[0];
                    verification_status = result['verification_status'];
                    exist_code = result['verification_code'];
                    if (verification_status == 1) {
                        callback(null, 0, 'Already verified.', {});
                    } else if (exist_code != code) {
                        callback(null, 0, 'Verification failed.', {});
                    } else {
                        User.update({email: email_id}, {
                            verification_status: 1,
                            verification_code: ''
                        }, function (err, result) {
                            if (err) {
                                callback(null, 0, err, {});
                            } else {
                                callback(null, 1, 'Verified!! You can login now', {});
                            }
                        });
                    }
                }
            }
        });
    };
    User.remoteMethod(
            'do_user_verification', {
                accepts: [
                    {arg: 'email', type: 'string'},
                    {arg: 'code', type: 'string'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ]
            }
    );
//********************************* END USER VERIFICATION **********************************

//********************************* START RESEND VERIFICATION CODE **********************************
    User.resend_verification_code = function (email_id, callback) {
        email_id = email_id.toLowerCase();
        where = {
            email: email_id
        };
        User.find({where: where}, function (err, result) {
            if (err) {
                callback(null, 0, err, {});
            } else {
                if (result.length == 0) {
                    callback(null, 0, 'Email Id not exists', {});
                } else {
                    result = result[0];
                    verification_status = result['verification_status'];
                    if (verification_status == 1) {
                        callback(null, 0, 'Already verified.', {});
                    } else {
                        new_verification_code = UTIL.get_random_number();
                        new_verification_code = new_verification_code.toString();
                        User.update({email: email_id}, {
                            verification_code: new_verification_code
                        }, function (err, result) {
                            if (err) {
                                callback(null, 0, err, {});
                            } else {
                                User.app.models.email.resendVerification({email: email_id, verification_code: new_verification_code}, function () {
                                    callback(null, 1, 'Check your email for new verification code', {});
                                });
                            }
                        });
                    }
                }
            }
        });
    };
    User.remoteMethod(
            'resend_verification_code', {
                accepts: [
                    {arg: 'email', type: 'string'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ]
            }
    );
//********************************* END RESEND VERIFICATION CODE **********************************



//********************************* START FORGET PASSWORD **********************************
    User.forgot_password = function (email_id, callback) {
        email_id = email_id.toLowerCase();
        where = {
            email: email_id
        };
        User.find({where: where}, function (err, result) {
            if (err) {
                callback(null, 0, err);
            } else {
                if (result.length == 0) {
                    callback(null, 0, 'You should get a new password on your email address, if you have an account with us.');
                } else {
                    result = result[0];
                    new_password = generatePassword(4, false);
                    new_password = new_password.toString();
                    UTIL.encode_password(new_password, function (hash_password) {
                        User.update({email: email_id}, {
                            password: hash_password
                        }, function (err, result) {
                            if (err) {
                                callback(null, err);
                            } else {
                                User.app.models.email.forgotPassword({email: email_id, new_password: new_password}, function () {
                                    callback(null, 1, 'You will get a new password on your email address, if you have an account with us.');
                                });
                            }
                        });
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'forgot_password', {
                accepts: [
                    {arg: 'email', type: 'string'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'}
                ]
            }
    );
//********************************* END FORGET PASSWORD **********************************

//********************************* START RESET PASSWORD **********************************
    User.reset_password = function ( req, password, callback) {
        var access_token_userid = req.accessToken.userId;
        User.findById( access_token_userid, function(err, user) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                user.updateAttribute('password', password, function(err, user) {
                    if (err) {
                        callback(null, 0, 'Error', {});
                    }else{
                        callback(null, 1, 'Password updated successfully', {});
                    }
                });
            }
        });
    };
    User.remoteMethod(
            'reset_password', {
                accepts: [
                    {arg: 'req', type: 'object', 'http': {source: 'req'}},
                    {arg: 'password', type: 'string'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ]
            }
    );
//********************************* END RESET PASSWORD **********************************

};
