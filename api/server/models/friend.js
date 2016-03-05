var UTIL = require('../modules/generic');
var ObjectID = require('mongodb').ObjectID;

module.exports = function (Friend) {
    Friend.disableRemoteMethod("create", true);
    Friend.disableRemoteMethod("upsert", true);
    Friend.disableRemoteMethod("updateAll", true);
    Friend.disableRemoteMethod("updateAttributes", false);
    Friend.disableRemoteMethod("find", true);
    Friend.disableRemoteMethod("findById", true);
    Friend.disableRemoteMethod("findOne", true);
    Friend.disableRemoteMethod("deleteById", true);
    Friend.disableRemoteMethod("login", true);
    Friend.disableRemoteMethod("logout", true);
    Friend.disableRemoteMethod("confirm", true);
    Friend.disableRemoteMethod("count", true);
    Friend.disableRemoteMethod("exists", true);
    Friend.disableRemoteMethod("resetPassword", true);
    Friend.disableRemoteMethod('createChangeStream', true);
    Friend.disableRemoteMethod('__count__accessTokens', false);
    Friend.disableRemoteMethod('__create__accessTokens', false);
    Friend.disableRemoteMethod('__delete__accessTokens', false);
    Friend.disableRemoteMethod('__destroyById__accessTokens', false);
    Friend.disableRemoteMethod('__findById__accessTokens', false);
    Friend.disableRemoteMethod('__get__accessTokens', false);
    Friend.disableRemoteMethod('__updateById__accessTokens', false);
    //********************************* START REGISTER AND LOGIN **********************************
    Friend.add_friend = function (req, chat_with, currentTimestamp, callback) {
        if (typeof req.accessToken == 'undefined' || req.accessToken == null || req.accessToken == '' || typeof req.accessToken.userId == 'undefined' || req.accessToken.userId == '') {
            callback(null, 0, 'UnAuthorized', {});
        } else {
            var access_token_userid = req.accessToken.userId;
            Friend.findById(access_token_userid, function (err, user) {
                if (err) {
                    callback(null, 0, 'UnAuthorized 1', {});
                } else {
                    var owner_user_id = access_token_userid;
                    var room_users = [
                        owner_user_id,
                        chat_with
                    ];
                    var ru = room_users;
                    for (var k in room_users) {
                        room_users[k] = new ObjectID(room_users[k]);
                    }
                    var check_where = {
                        where: {
                            room_users: {'all': room_users}
                        }
                    };
                    Friend.find(check_where, function (err, result) {
                        if (err) {
                            callback(null, 0, 'try again', {});
                        } else {
                            if (result.length > 0) {
                                result = result[0];
                                var room_id = result.id;
                                var data = {
                                    'room_id': room_id
                                };
                                callback(null, 1, 'Friend already exists', data);
                            } else {
                                var new_room = new Friend({
                                    room_owner: new ObjectID(owner_user_id),
                                    room_users: room_users,
                                    registration_time: currentTimestamp,
                                    registration_date: UTIL.currentDate(currentTimestamp),
                                    registration_date_time: UTIL.currentDateTimeDay(currentTimestamp)
                                });
                                new_room.save(function (err) {
                                    if (err) {
                                        callback(null, 0, 'try again', {});
                                    } else {
                                        var room_id = new_room.id;
                                        var data = {
                                            'room_id': room_id
                                        };
                                        callback(null, 1, 'Chat Friend Created', data);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    };
    Friend.remoteMethod(
            'add_friend', {
                description: 'Add a friend',
                accepts: [
//                    {arg: 'req', type: 'object', 'http': {source: 'req'}},
                    {arg: 'user_id', type: 'string'},
                    {arg: 'friend_id', type: 'string'}
                ],
                returns: [
                    {arg: 'status', type: 'number'},
                    {arg: 'message', type: 'string'},
                    {arg: 'data', type: 'array'}
                ],
                http: {
                    verb: 'post', path: '/add_friend'
                }
            }
    );
//********************************* END REGISTER AND LOGIN ************************************    

};
