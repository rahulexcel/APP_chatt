 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('publicChatService', publicChatService);

     function publicChatService($q, timeStorage, chatsFactory, $rootScope, timeZoneService) {
         var service = {};
         var q = $q.defer();
         service.listRooms = function() {
             var userData = timeStorage.get('userData');
             var query = chatsFactory.save({
                 accessToken: userData.data.access_token,
                 room_type:'public',
                 timestamp:_.now(),
             });
             query.$promise.then(function(data) {
                if(data.data.rooms){
                    timeStorage.set('displayPublicChats', data.data.rooms, 1);
                } else{
                    timeStorage.set('displayPublicChats', false, 1);
                }
             });
         }
         return service;
     };

 })();