 (function() {
     'use strict';
     angular.module('starter')
         .factory('socketService', socketService);

     function socketService($q, timeStorage) {
         var service = {};
         var userData = timeStorage.get('userData');
         var accessToken = userData.data.access_token;
         service.new_private_room = function() {
                 var q = $q.defer();
                 socket.on('new_private_room', function(data) {
                     socket.removeAllListeners();
                     q.resolve(data);
                 });
                 return q.promise;
             },
             service.create_private_room = function(chatWithUserId) {
                 var q = $q.defer();
                 socket.emit('create_private_room', accessToken, chatWithUserId, _.now());
                 service.new_private_room().then(function(data) {
                     q.resolve(data);
                 });
                 return q.promise;
             },
             service.room_message = function(roomId, message) {
                console.log('service is calling');
                 socket.emit('room_message', accessToken, roomId, message, _.now());
             }
         return service;
     };
 })();