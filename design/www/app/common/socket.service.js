 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('socketService', socketService);

     function socketService($rootScope, $q, timeStorage, sqliteService) {
         var service = {};
         var userData = timeStorage.get('userData');
         var accessToken = userData.data.access_token;
         socket.on('new_room_message', function(data) {
                    sqliteService.gotNewRoomMessage(data.message_body, data.message_id, data.message_status, data.message_time, data.name, data.profile_image, data.room_id);
                    $rootScope.$broadcast('newRoomMessage', { data: data });
                });
         socket.on('sent_message_response', function(data) {
                    $rootScope.$broadcast('sentMessagesIds', { data: data });
                    sqliteService.updateMessageStatusToSent(data.msg_local_id, data.message_id, data.message_time);
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
                     socket.emit('room_open', data.data.room_id);
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
                 socket.emit('room_message', msg_local_id, accessToken, roomId, message, currentTimestamp);
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
             }
         return service;
     };
 })();