 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('chatsService', chatsService);

     function chatsService(timeStorage) {
         var service = {};
         var userData =  timeStorage.get('userData');
         service.privateRooms = function(roomData) {
             var returnData = [];
             for(var i=0; i < roomData.length; i++){
                var newRoomData = [];
                for(var j = 0; j < roomData[i].room_users.length; j++){
                    if(roomData[i].room_users[j].id != userData.data.user_id){
                        newRoomData.user_data = roomData[i].room_users[j];
                    }
                }
                newRoomData.room_id = roomData[i].id;
                returnData.push(newRoomData);
             }
             return returnData;
         }
         return service;
     };

 })();