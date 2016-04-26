var UTIL = require('../modules/generic');
var lodash = require('lodash');
var moment = require('moment');
var generatePassword = require('password-generator');
var ObjectID = require('mongodb').ObjectID;
module.exports = function (User) {
    //--start--USER GENERIC function------
    User.FN_get_user_by_id = function( userId, callback ){
        var where = {
            'where' : {
                'id' : new ObjectID( userId )
            }
        };
        User.find( where, function (err, result) {
            if( err ){
                callback( 0, 'error occurs', {});
            }else{
                if( result.length > 0 ){
                    result = result[0];
                    callback( 1, 'user found', result );
                }else{
                    callback( 0, 'no user found', {} );
                }
            }
        });
    };
    User.FN_get_user_status = function( info, callback ){
        var status = info.status;
        var last_seen = info.last_seen;
        
        var ret_status = 'offline';
        
        var away_time = 60 * 3; // 3 minutes
        
        if( typeof status != 'undefined' && typeof last_seen != 'udefined'){
            ret_status = status;
            if( last_seen != '' ){
                var server_time = UTIL.currentTimestamp();
                var time_diff = server_time - last_seen;
                if( time_diff > 0 && time_diff > away_time ){
                    ret_status = 'away';
                }
            }
        }
        callback( ret_status );
        
    };
    //--end--USER GENERIC function------
    
    
    //********************************* START REGISTER AND LOGIN **********************************
    User.register_login = function (action, action_type, social_id, platform, device_id, token, email_id, name, password, profile_image, currentTimestamp, callback) {
        var LIFE_OF_ACCESS_TOKEN = 60 * 60 * 24 * 1000;
        if (action && action_type && email_id) {
            if (typeof name == 'undefined' || name == '') {
                name = '';
            } else {
                name = name.toLowerCase();
            }
            if (typeof profile_image == 'undefined' || profile_image == '') {
                profile_image = '';
            }
            email_id = email_id.toLowerCase();
            where = {
                email: email_id
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
                                    result.createAccessToken(LIFE_OF_ACCESS_TOKEN, function (err, accessToken) {
                                        if (err) {
                                            callback(null, 0, 'Invalid login', {});
                                        } else {
                                            //--start-- update user device_id and token
                                            User.update( {email: email_id}, {
                                                device_id: device_id,
                                                token: token,
                                                status : 'online'
                                            }, function (err, result11) {
                                                if (err) {
                                                    callback(null, 0, err, {});
                                                } else {
                                                   var data = {
                                                        user_id: accessToken.userId,
                                                        access_token: accessToken.id,
                                                        name : result.name,
                                                        profile_image : result.profile_image
                                                    };
                                                    callback(null, 1, 'Success login', data);
                                                }
                                            });
                                            //--end-- update user device_id and token
                                        }
                                    });
                                } else {
                                    if (r_verification_status == 0) {
                                        callback(null, 3, 'Please verify you account first', {});
                                    } else {
                                        //-START--get access token---------
                                        User.login({
                                            email: email_id,
                                            password: password,
                                            ttl: LIFE_OF_ACCESS_TOKEN
                                        }, function (err, accessToken) {
                                            if (err) {
                                                callback(null, 0, 'Invalid login', {});
                                            } else {
                                                //--start-- update user device_id and token
                                                User.update( {email: email_id}, {
                                                    device_id: device_id,
                                                    token: token,
                                                    status : 'online'
                                                }, function (err, result11) {
                                                    if (err) {
                                                        callback(null, 0, err, {});
                                                    } else {
                                                        var data = {
                                                            user_id: result.id,
                                                            access_token: accessToken.id,
                                                            name : result.name,
                                                            profile_image : result.profile_image
                                                        };
                                                        callback(null, 1, 'Success login', data);
                                                    }
                                                });
                                                //--end-- update user device_id and token
                                            }
                                        })
                                        //-END----get access token---------
                                    }
                                }
                            }
                        } else {
                            if (action_type == 'manual_login') {
                                callback(null, 0, 'Email id not exists', {});
                            } else if (name == '') {
                                callback(null, 0, 'Name required', {});
                            } else if (action_type != 'facebook' && action_type != 'google' && (typeof password == 'undefined' || password == '')) {
                                callback(null, 0, 'Password required', {});
                            } else {
                                //random password when regsiter by facebook and google
                                if (action_type == 'facebook' || action_type == 'google') {
                                    password = UTIL.get_random_number();
                                }
                                password = password.toString();
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
                                    device_id: '',
                                    token: '',
                                    email: email_id,
                                    name: name,
                                    password: password,
                                    last_seen: '',
                                    registration_time: currentTimestamp,
                                    registration_date: UTIL.currentDate(currentTimestamp),
                                    registration_date_time: UTIL.currentDateTimeDay(currentTimestamp),
                                    profile_image: profile_image,
                                    profile_status: '',
                                    room_background_image : ''
                                }, function (err, user) {
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
                                            //--send access token if register is via facebook or google
                                            if (action_type == 'facebook' || action_type == 'google') {
                                                user.createAccessToken(LIFE_OF_ACCESS_TOKEN, function (err, accessToken) {
                                                    if (err) {
                                                        callback(null, 0, 'Invalid login', {});
                                                    } else {
                                                        var data = {
                                                            user_id: accessToken.userId,
                                                            access_token: accessToken.id,
                                                            name : name,
                                                            profile_image : profile_image
                                                        };
                                                        callback(null, 1, 'Success Registration', data);
                                                    }
                                                });
                                            } else {
                                                callback(null, 1, 'Successful Registration', data);
                                            }
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
                    {arg: 'profile_image', type: 'string'},
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
    User.reset_password = function (req, password, callback) {
        var access_token_userid = req.accessToken.userId;
        User.findById(access_token_userid, function (err, user) {
            if (err) {
                callback(null, 0, 'UnAuthorized', {});
            } else {
                user.updateAttribute('password', password, function (err, user) {
                    if (err) {
                        callback(null, 0, 'Error', {});
                    } else {
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

//********************************* START LIST OF ALL USERS **********************************
    User.list_users = function ( accessToken, page, limit, currentTimestamp, callback) {
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 401, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 401, 'UnAuthorized', {});
                }else{
                    var access_token_userid = accessToken.userId
                    if (lodash.isUndefined(page) && lodash.isUndefined(limit)) {
                        callback(null, 0, 'Invalid Request Parameters', {});
                    }
                    else {
                        var num = 0;
                        num = page * 1;
                        User.findById(access_token_userid, function (err, user) {
                            if (err) {
                                callback(null, 0, 'UnAuthorized 1', err);
                            } else {
                                var where = {
                                    id: {neq: access_token_userid},
                                    verification_status: 1*1,
                                    friends : { 'nin' : [access_token_userid] },
                                };
                                User.find({
                                    where: where,
                                    limit: limit,
                                    skip: num * limit,
                                    order: 'last_seen DESC'
                                }, function (err, result) {
                                    if (err) {
                                        callback(null, 0, 'Try Again', err);
                                    }
                                    else {
                                        var userInfo = [];
                                        if (result.length > 0) {
                                            lodash.forEach(result, function (value) {
                                                var userName = value.name;
                                                var userId = value.id;
                                                var pic = value.profile_image;
                                                var lastSeen = value.last_seen;
                                                
                                                var aa = {
                                                    status : value.status,
                                                    last_seen : value.last_seen
                                                }
                                                status = '';
                                                User.FN_get_user_status( aa, function(s){
                                                    status = s;
                                                });
                                                userInfo.push({name: userName, id: userId, pic: pic, lastSeen: lastSeen, status : status });
                                            });
                                            callback(null, 1, 'Users List', userInfo);
                                        }
                                        else {
                                            callback(null, 0, 'No Record Found', {});
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    };
    User.remoteMethod(
            'list_users', {
                description: 'Show the list of all Users',
                accepts: [
                    //{arg: 'req', type: 'object', 'http': {source: 'req'}},
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'page', type: 'number'},
                    {arg: 'limit', type: 'number'},
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/list_users',
                }
            }
    );
//********************************* END LIST OF ALL USERS ************************************  

//********************************* START LAST SEEN **********************************
    User.last_seen = function ( accessToken, currentTimestamp, callback) {
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.findById(userId, function (err, user) {
                        if (err) {
                            callback(null, 0, 'UnAuthorized', {});
                        } else {
                            var server_time = UTIL.currentTimestamp();
                            user.updateAttributes({
                                'last_seen' : server_time,
                                'status' : 'online'
                            },function (err, user) {
                                if (err) {
                                    callback(null, 0, 'Error', {});
                                } else {
                                    callback(null, 1, 'Last seen updated successfully', {});
                                }
                            });
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'last_seen', {
                description: 'update last seen od user',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/last_seen',
                }
            }
    );
//********************************* END LAST SEEN **********************************

//********************************* START my profile ( logged user profile) **********************************
    User.my_profile = function ( accessToken, currentTimestamp, callback) {
        var Room = User.app.models.Room;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.findById(userId, function (err, user) {
                        if (err) {
                            callback(null, 0, 'UnAuthorized', {});
                        } else {
                            Room.find({
                                'where':{
                                    room_users : {'all':[new ObjectID( userId )]}
                                }
                            },function( err1, rooms ){
                                if( err1 ){
                                    callback(null, 0, 'try again', {});
                                }else{
                                    var user_private_rooms = 0;
                                    var user_public_rooms = 0;
                                    if( rooms.length > 0 ){
                                        for( var k in rooms){
                                            r_type = rooms[k].room_type;
                                            if( r_type == 'public' ){
                                                user_public_rooms += 1;
                                            }else if( r_type == 'private' ){
                                                user_private_rooms += 1;
                                            }
                                        }
                                    }
                                    var USER_PROFILE = {
                                        'user_id' : user.id,
                                        'name' : user.name,
                                        'profile_image' : user.profile_image,
                                        'profile_status' : user.profile_status,
                                        'last_seen' : user.last_seen,
                                        'user_private_rooms' : user_private_rooms,
                                        'user_public_rooms' : user_public_rooms,
                                    }
                                    callback(null, 1, 'User profile details', USER_PROFILE);
                                }
                            })
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'my_profile', {
                description: 'get logged user profile',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/my_profile',
                }
            }
    );
//********************************* END my profile ( logged user profile) **********************************


//********************************* START user profile ( any user profile on user_id basis ) **********************************
    User.get_user_profile = function ( accessToken, user_id, currentTimestamp, callback) {
        var Room = User.app.models.Room;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    User.find({
                        'where' : {
                            '_id' : new ObjectID( user_id )
                        }
                    }, function (err, results) {
                        if (err) {
                            callback(null, 0, 'try again', {});
                        } else {
                            if( results.length == 0 ){
                                callback(null, 0, 'No user Found', {});
                            }else{
                                user = results[0];
                                Room.find({
                                    'where':{
                                        room_users : {'all':[new ObjectID( user_id )]}
                                    }
                                },function( err1, rooms ){
                                    if( err1 ){
                                        callback(null, 0, 'try again', {});
                                    }else{
                                        var user_private_rooms = 0;
                                        var user_public_rooms = 0;
                                        if( rooms.length > 0 ){
                                            for( var k in rooms){
                                                r_type = rooms[k].room_type;
                                                if( r_type == 'public' ){
                                                    user_public_rooms += 1;
                                                }else if( r_type == 'private' ){
                                                    user_private_rooms += 1;
                                                }
                                            }
                                        }
                                        var aa = {
                                            status : user.status,
                                            last_seen : user.last_seen
                                        }
                                        status = '';
                                        User.FN_get_user_status( aa, function(s){
                                            status = s;
                                        });
                                        var USER_PROFILE = {
                                            'user_id' : user.id,
                                            'name' : user.name,
                                            'profile_image' : user.profile_image,
                                            'profile_status' : user.profile_status,
                                            'last_seen' : user.last_seen,
                                            'user_private_rooms' : user_private_rooms,
                                            'user_public_rooms' : user_public_rooms,
                                            'status' : status
                                        }
                                        callback(null, 1, 'User profile details', USER_PROFILE);
                                    }
                                })
                            }
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'get_user_profile', {
                description: 'get any user profile info',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'user_id', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/get_user_profile',
                }
            }
    );
//********************************* START user profile ( any user profile on user_id basis ) **********************************


//********************************* START logged in user can update his profile **********************************
    User.update_profile_status = function ( accessToken, status, currentTimestamp, callback) {
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.findById(userId, function (err, user) {
                        if (err) {
                            callback(null, 0, 'UnAuthorized', {});
                        } else {
                            if( user == null ){
                                callback(null, 0, 'user not found', {});
                            }else{
                                user.updateAttribute('profile_status', status, function (err, user) {
                                    if (err) {
                                        callback(null, 0, 'Error', {});
                                    } else {
                                        d = {
                                            status : status
                                        }
                                        callback(null, 1, 'Status update', d);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'update_profile_status', {
                description: 'logged in user can update his profile status',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'status', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/update_profile_status',
                }
            }
    );
//********************************* END logged in user can update his profile **********************************


//********************************* START Logout**********************************
    User.do_logout = function ( accessToken, currentTimestamp, callback) {
        var accessToken_original = accessToken;
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.logout(accessToken_original, function(err) {
                        if( err ){
                            callback(null, 0, 'error occurs', {});
                        }else{
                            User.update({
                                id: new ObjectID( userId )
                            }, {
                                status : 'offline',
                                token : '',
                                device_id : ''
                            }, function (err, result) {
                                if (err) {
                                } else {
                                }
                            });
                            var d = {
                                user_id : userId
                            }
                            callback(null, 1, 'Success logout', d );
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'do_logout', {
                description: 'logout user',
                accepts: [
                    {arg: 'accessToken', type: 'string'},
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/do_logout',
                }
            }
    );
//********************************* END log out **********************************



//********************************* START logged in user can update his profile_image**********************************
    User.update_profile_image = function ( accessToken, image_url, currentTimestamp, callback) {
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.findById(userId, function (err, user) {
                        if (err) {
                            callback(null, 0, 'UnAuthorized', {});
                        } else {
                            if( user == null ){
                                callback(null, 0, 'user not found', {});
                            }else{
                                user.updateAttribute('profile_image', image_url, function (err, user) {
                                    if (err) {
                                        callback(null, 0, 'Error', {});
                                    } else {
                                        d = {
                                            profile_image : image_url
                                        }
                                        callback(null, 1, 'Profile image updated', d);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'update_profile_image', {
                description: 'logged in user can update his profile image',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'image_url', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/update_profile_image',
                }
            }
    );
//********************************* END logged in user can update his profile **********************************


//********************************* START logged in user can update his room background image ( images will be comman for all rooms )**********************************
    User.update_room_background_image = function ( accessToken, image_url, currentTimestamp, callback) {
        User.relations.accessTokens.modelTo.findById(accessToken, function(err, accessToken) {
            if( err ){
                callback(null, 0, 'UnAuthorized', {});
            }else{
                if( !accessToken ){
                    callback(null, 0, 'UnAuthorized', {});
                }else{
                    var userId = accessToken.userId
                    User.findById(userId, function (err, user) {
                        if (err) {
                            callback(null, 0, 'UnAuthorized', {});
                        } else {
                            if( user == null ){
                                callback(null, 0, 'user not found', {});
                            }else{
                                user.updateAttribute('profile_image', image_url, function (err, user) {
                                    if (err) {
                                        callback(null, 0, 'Error', {});
                                    } else {
                                        d = {
                                            room_background_image : image_url
                                        }
                                        callback(null, 1, 'Background image updated', d);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    };
    User.remoteMethod(
            'update_room_background_image', {
                description: 'logged in user can update his chat background image',
                accepts: [
                    {arg: 'accessToken', type: 'string'}, 
                    {arg: 'image_url', type: 'string'}, 
                    {arg: 'currentTimestamp', type: 'number'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/update_profile_image',
                }
            }
    );
//********************************* END logged in user can update his room background image ( images will be comman for all rooms )**********************************






};
