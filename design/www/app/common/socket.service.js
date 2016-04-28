(function() {
    'use strict';
    angular.module('chattapp')
            .factory('socketService', socketService);

    function socketService($rootScope, $q, timeStorage, sqliteService) {
        var service = {};
        var userData = timeStorage.get('userData');
        var accessToken = userData.data.access_token;
        socket.on('RESPONSE_APP_SOCKET_EMIT', function(type, data) {
            if (type == 'leave_public_group') {
                $rootScope.$broadcast('leaved_public_group', {data: data});
            }
            console.log(type);
            console.log(data);
            if (type == 'sent_message_response') {
                $rootScope.$broadcast('sentMessagesIds', {data: data.data});
                sqliteService.updateMessageStatusToSent(data.data.msg_local_id, data.data.message_id, data.data.message_time);
            }
            if (type == 'new_room_message') {
                sqliteService.gotNewRoomMessage(data.data.message_body, data.data.message_id, data.data.message_status, data.data.message_time, data.data.name, data.data.profile_image, data.data.room_id, data.data.message_type);
                $rootScope.$broadcast('newRoomMessage', {data: data.data});
            }
            if (type == 'remove_public_room_member') {
                $rootScope.$broadcast('removed_public_room_member', {data: data.data});
            }
            if (type == 'remove_socket_from_room') {
                if (userData.data.user_id == data.user_id) {
                    socket.emit('APP_SOCKET_EMIT', 'remove_socket_from_room', {user_id: data.user_id, room_id: data.room_id});
                }
            }
            if (type == 'get_user_profile_for_room') {
                $rootScope.$broadcast('got_user_profile_for_room', {data: data.data});
            }
            if (type == 'delete_public_room') {
                $rootScope.$broadcast('deleted_public_room', {data: data.data});
            }
            if (type == 'room_user_typing') {
                $rootScope.$broadcast('room_user_typing_message', {data: data});
            }
            if (type == 'show_room_unread_notification') {
                $rootScope.$broadcast('got_room_unread_notification', {data: data});
            }
            if (type == 'update_room_unread_notification') {
                $rootScope.$broadcast('update_room_unread_notification', {data: data});
            }
            if (type == 'get_user_profile') {
                $rootScope.$broadcast('got_user_updated_profile', {data: data});
            }
            if (type == 'admin_add_user_to_public_room') {
                $rootScope.$broadcast('admin_added_user_to_public_room', {data: data});
            }
            if (type == 'delete_private_room') {
                $rootScope.$broadcast('private_room_deleted', {data: data});
            }
            if (type == 'block_private_room') {
                $rootScope.$broadcast('private_room_blocked', {data: data});
            }
            if (type == 'unblock_user') {
                $rootScope.$broadcast('user_unblocked', {data: data});
            }

        });
        socket.on('response_update_message_status', function(data) {
            var str = data.message_id;
            var res = str.split(",");
            sqliteService.updateMessageStatusToSeen(data.message_id);
            $rootScope.$broadcast('response_update_message_status_response', {data: res});
        });
        service.new_private_room = function() {
            var q = $q.defer();
            socket.on('new_private_room', function(data) {
                socket.removeListener('new_private_room');
                q.resolve(data);
            });
            return q.promise;
        },
                service.create_room = function(chatWithUserId) {
                    var q = $q.defer();
                    var userData = timeStorage.get('userData');
                    var accessToken = userData.data.access_token;
                    socket.emit('create_room', accessToken, 'private', chatWithUserId, '', '', _.now());
                    service.new_private_room().then(function(data) {
                        socket.emit('APP_SOCKET_EMIT', 'room_open', {accessToken: accessToken, room_id: data.data.room_id, currentTimestamp: _.now()});
                        q.resolve(data);
                    });
                    return q.promise;
                },
                service.joinPublicRoom = function(roomId) {
                    var q = $q.defer();
                    var userData = timeStorage.get('userData');
                    var accessToken = userData.data.access_token;
                    socket.emit('APP_SOCKET_EMIT', 'join_public_room', {accessToken: accessToken, room_id: roomId, currentTimestamp: _.now()});
                    socket.on('RESPONSE_APP_SOCKET_EMIT', function(type, data) {
                        if (type == 'join_public_room') {
                            q.resolve(data);
                        }
                    });
                    return q.promise;
                },
                service.room_message = function(msg_local_id, roomId, message, currentTimestamp) {
                    socket.emit('APP_SOCKET_EMIT', 'room_message', {msg_local_id: msg_local_id, accessToken: accessToken, room_id: roomId, message_type: 'text', message: message, currentTimestamp: currentTimestamp});
                },
                service.update_message_status = function(messages, roomId) {
                    var array = [];
                    if (messages) {
                        for (var i = 0; i < messages.length; i++) {
                            if (messages[i].message_status == 'sent' && messages[i].message_owner.id != userData.data.user_id) {
                                array.push(messages[i].id);
                            }
                        }
                    }
                    if (array.toString() == '') {
                        console.log('empty');
                    } else {
                        socket.emit('update_message_status', accessToken, roomId, array.toString(), 'seen', _.now());
                        for (var i = 0; i < array.length; i++) {
                            sqliteService.updateMessageStatusToSeen(array[i]);
                        }
                    }
                },
                service.update_message_status_room_open = function(message_id, roomId) {
                    socket.emit('update_message_status', accessToken, roomId, message_id, 'seen', _.now());
                    sqliteService.updateMessageStatusToSeen(message_id);
                },
                service.leaveGroup = function(roomId) {
                    var userData = timeStorage.get('userData');
                    socket.emit('APP_SOCKET_EMIT', 'leave_public_group', {accessToken: userData.data.access_token, room_id: roomId, currentTimestamp: _.now()});
                },
                service.removeUserFromGroup = function(removingUserData, roomId) {
                    var userData = timeStorage.get('userData');
                    socket.emit('APP_SOCKET_EMIT', 'remove_public_room_member', {accessToken: userData.data.access_token, room_id: roomId, user_id: removingUserData.id, currentTimestamp: _.now()});
                },
                service.getUserProfileForRoom = function(roomId, userId) {
                    var userData = timeStorage.get('userData');
                    socket.emit('APP_SOCKET_EMIT', 'get_user_profile_for_room', {accessToken: userData.data.access_token, room_id: roomId, user_id: userId, currentTimestamp: _.now()});
                },
                service.deleteRoom = function(roomId) {
                    var userData = timeStorage.get('userData');
                    socket.emit('APP_SOCKET_EMIT', 'delete_public_room', {accessToken: userData.data.access_token, room_id: roomId, currentTimestamp: _.now()});
                },
                service.logout = function() {
                    var userData = timeStorage.get('userData');
                    socket.emit('APP_SOCKET_EMIT', 'do_logout', {accessToken: userData.data.access_token, currentTimestamp: _.now()});
                },
                service.writingMessage = function(roomId) {
                    var userData = timeStorage.get('userData');
                    socket.emit('APP_SOCKET_EMIT', 'room_user_typing', {user_id: userData.data.user_id, name: userData.data.name, room_id: roomId});
                },
                service.room_unread_notification = function(allRoomData) {
                    var userData = timeStorage.get('userData');
                    for (var i = 0; i < allRoomData.length; i++) {
                        socket.emit('APP_SOCKET_EMIT', 'show_room_unread_notification', {accessToken: userData.data.access_token, room_id: allRoomData[i].room_id, currentTimestamp: _.now()});
                        socket.emit('APP_SOCKET_EMIT', 'room_open', {accessToken: userData.data.access_token, room_id: allRoomData[i].room_id, currentTimestamp: _.now()});
                    }
                },
                service.update_room_unread_notification = function(data) {
                    var userData = timeStorage.get('userData');
                    socket.emit('APP_SOCKET_EMIT', 'show_room_unread_notification', {accessToken: userData.data.access_token, room_id: data.room_id, currentTimestamp: _.now()});
                    socket.emit('APP_SOCKET_EMIT', 'room_open', {accessToken: userData.data.access_token, room_id: data.room_id, currentTimestamp: _.now()});
                },
                service.getUserProfile = function(chatData) {
                    var userData = timeStorage.get('userData');
                    for (var i = 0; i < chatData.length; i++) {
                        if (chatData[i].room_type == 'private') {
                            socket.emit('APP_SOCKET_EMIT', 'get_user_profile', {accessToken: userData.data.access_token, user_id: chatData[i].user_data.id, currentTimestamp: _.now()});
                        }
                    }
                },
                service.roomOpen = function(roomId) {
                    var userData = timeStorage.get('userData');
                    socket.emit('APP_SOCKET_EMIT', 'room_open', {accessToken: userData.data.access_token, room_id: roomId, currentTimestamp: _.now()});

                },
                service.addInGroup = function(roomId, userId) {
                    var userData = timeStorage.get('userData');
                    socket.emit('APP_SOCKET_EMIT', 'admin_add_user_to_public_room', {accessToken: userData.data.access_token, room_id: roomId, user_id:userId, currentTimestamp: _.now()});
                },
                service.leavePrivateChat = function(roomId) {
                    var userData = timeStorage.get('userData');
                    socket.emit('APP_SOCKET_EMIT', 'delete_private_room', {accessToken: userData.data.access_token, room_id: roomId, currentTimestamp: _.now()});
                },
                service.blockPrivateUser = function(roomId) {
                    var userData = timeStorage.get('userData');
                    socket.emit('APP_SOCKET_EMIT', 'block_private_room', {accessToken: userData.data.access_token, room_id: roomId, currentTimestamp: _.now()});
                },
                service.unblockUser = function(unblockUserData) {
                    console.log(unblockUserData.id);
                    var userData = timeStorage.get('userData');
                    console.log(userData.data.access_token);
                    socket.emit('APP_SOCKET_EMIT', 'unblock_user', {accessToken: userData.data.access_token, user_id: unblockUserData.id, currentTimestamp: _.now()});
                };
        return service;
    }
    ;
})();