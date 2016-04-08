 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('socketService', socketService);

     function socketService($rootScope, $q, timeStorage, sqliteService) {
         var service = {};
         var userData = timeStorage.get('userData');
         var accessToken = userData.data.access_token;
         socket.on('RESPONSE_APP_SOCKET_EMIT', function(type, data) {
                    if(type == 'leave_public_group'){
                        $rootScope.$broadcast('leaved_public_group', { data: data });
                    }
                    console.log(type);
                    console.log(data);
                    if(type == 'sent_message_response'){
                        $rootScope.$broadcast('sentMessagesIds', { data: data.data });
                        sqliteService.updateMessageStatusToSent(data.data.msg_local_id, data.data.message_id, data.data.message_time);
                    }
                    if(type == 'new_room_message'){
                        sqliteService.gotNewRoomMessage(data.data.message_body, data.data.message_id, data.data.message_status, data.data.message_time, data.data.name, data.data.profile_image, data.data.room_id, data.data.message_type);
                        $rootScope.$broadcast('newRoomMessage', { data: data.data });
                    }
                    if(type == 'remove_public_room_member'){
                        $rootScope.$broadcast('removed_public_room_member', { data: data.data });
                    }
                });
         socket.on('response_update_message_status', function(data) {
                    var str = data.message_id;
                    var res = str.split(",");
                    sqliteService.updateMessageStatusToSeen(data.message_id);
                    $rootScope.$broadcast('response_update_message_status_response', { data: res });
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
                     socket.emit('APP_SOCKET_EMIT', 'room_open', { accessToken: accessToken, room_id: data.data.room_id, currentTimestamp: _.now() });
                     roomData.room_id
                     q.resolve(data);
                 });
                 return q.promise;
             },
             service.joinPublicRoom = function(roomid) {
                 var q = $q.defer();
                 var userData = timeStorage.get('userData');
                 var accessToken = userData.data.access_token;
                 socket.emit('join_public_room', accessToken, roomid, _.now());
                 socket.on('RESPONSE_join_public_room', function(data) {
                     q.resolve(data);
                 });
                 return q.promise;
             },
             service.room_message = function(msg_local_id, roomId, message, currentTimestamp) {
                socket.emit('APP_SOCKET_EMIT', 'room_message', { msg_local_id: msg_local_id, accessToken:  accessToken, room_id: roomId, message_type:'text', message:message, currentTimestamp: currentTimestamp});
             },
             service.update_message_status = function(messages, roomId) {
                var array = [];
                if(messages){
                    for(var i =0; i < messages.length; i++){
                    if(messages[i].message_status == 'sent' && messages[i].message_owner.id != userData.data.user_id){
                        array.push(messages[i].id);
                        }
                    }
                }
                if(array.toString() == ''){
                    console.log('empty');
                } else{
                    socket.emit('update_message_status', accessToken, roomId, array.toString(), 'seen', _.now());
                    for(var i = 0; i < array.length; i++){
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
                socket.emit('APP_SOCKET_EMIT', 'leave_public_group', {  accessToken : userData.data.access_token, room_id: roomId, currentTimestamp : _.now() });
             },
             service.removeUserFromGroup = function(removingUserData, roomId) {
                var userData = timeStorage.get('userData');
                socket.emit('APP_SOCKET_EMIT', 'remove_public_room_member', {  accessToken : userData.data.access_token, room_id: roomId, user_id:removingUserData.id, currentTimestamp : _.now() });
             }
         return service;
     };
 })();