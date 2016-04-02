 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('chatsService', chatsService);

     function chatsService($q, timeStorage, chatsFactory, $rootScope, timeZoneService) {
         var service = {};
         var q = $q.defer();
         service.privateRooms = function(roomData, callback) {
             var userData =  timeStorage.get('userData');
             var returnData = [];
             for(var i=0; i < roomData.length; i++){
                var newRoomData = {};
                for(var j = 0; j < roomData[i].room_users.length; j++){
                    if(roomData[i].room_users[j].id != userData.data.user_id){
                        roomData[i].room_users[j].last_seenInTimestamp = roomData[i].room_users[j].last_seen;
                        roomData[i].room_users[j].last_seen = moment(parseInt(roomData[i].room_users[j].last_seen)).format("hh:mm a");
                        newRoomData.user_data = roomData[i].room_users[j];
                        newRoomData.room_id = roomData[i].id;
                        returnData.push(newRoomData);
                    }
                }
             }
             if(callback){
                callback(returnData)
             }
             q.resolve(returnData);
             return q.promise;
         },
         service.listMyRooms = function() {
             var q = $q.defer();
             var userData =  timeStorage.get('userData');
             var query = chatsFactory.save({
                 accessToken: userData.data.access_token,
                 room_type:'private',
                 timestamp:_.now(),
             });
             query.$promise.then(function(data) {
                var NoRoomData = [];
                if(data.data.rooms){
                    service.privateRooms(data.data.rooms, function(res){
                        timeStorage.set('displayPrivateChats', res, 1);
                        $rootScope.$broadcast('updatedRoomData', { data: res });
                        q.resolve(res);
                    }); 
                } else{
                    q.resolve(NoRoomData);
                }               
             });
             return q.promise;
         }
         return service;
     };

 })();