 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('socketService', socketService);

     function socketService($rootScope, $q, timeStorage, sqliteService) {
         var service = {};
         var userData = timeStorage.get('userData');
         var accessToken = userData.data.access_token;
         socket.on('new_room_message', function(data) {
                    $rootScope.$broadcast('newRoomMessage', { data: data });
                });
         socket.on('sent_message_response', function(data) {
                    $rootScope.$broadcast('sentMessagesIds', { data: data });
                    sqliteService.deleteSentMessage(data.msg_local_id);
                });
         socket.on('response_update_message_status', function(data) {
                    var str = data.message_id;
                    var res = str.split(",");
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
                 socket.emit('create_room', accessToken, 'private', chatWithUserId, '', '', _.now());
                 service.new_private_room().then(function(data) {
                     q.resolve(data);
                    socket.emit('room_open', data.data.room_id);
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
                    console.log('empty')
                } else{
                    socket.emit('update_message_status', accessToken, roomId, array.toString(), 'seen', _.now());
                }
             },
             service.update_message_status_room_open = function(message_id, roomId) {
                socket.emit('update_message_status', accessToken, roomId, message_id, 'seen', _.now());
             }
         return service;
     };
 })();