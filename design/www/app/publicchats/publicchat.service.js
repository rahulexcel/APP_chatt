 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('publicChatService', publicChatService);

     function publicChatService($q, timeStorage, $rootScope, getPublicRoomsFactory) {
         var service = {};
         var q = $q.defer();
         service.listRooms = function() {
             var userData = timeStorage.get('userData');
             var query = getPublicRoomsFactory.save({
                 accessToken: userData.data.access_token,
                 page:0,
                 limit:100,
                 timestamp:_.now()
             });
             query.$promise.then(function(data) {
                var newData = [];
                if(data.data.rooms){
//                    timeStorage.set('displayPublicChats', data.data.rooms, 1);
                    $rootScope.$broadcast('updatedDisplayPublicChats', { data: data.data.rooms });
                } else{
                    $rootScope.$broadcast('updatedDisplayPublicChats', { data: newData });
//                    timeStorage.set('displayPublicChats', newData, 1);
                }
             });
         }
         return service;
     };

 })();