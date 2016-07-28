 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('inviteInGroupService', inviteInGroupService);

     function inviteInGroupService(timeStorage, timeZoneService, $q, getRoomInfoFactory) {
         var service = {};
         service.userlist = function() {
            var q = $q.defer();
            var roomId = timeStorage.get('inviteInGroupId');
            var userData = timeStorage.get('userData');
            var query = getRoomInfoFactory.save({
                accessToken: userData.data.access_token,
                room_id: roomId,
                currentTimestamp: _.now()
            });
            query.$promise.then(function(data) {
                var noRoomData = [];
                if (data.data.admin_friends_not_room_members) {
                    for (var i = 0; i < data.data.admin_friends_not_room_members.length; i++) {
                        data.data.admin_friends_not_room_members[i].last_seen = moment.unix(data.data.admin_friends_not_room_members[i].last_seen).tz(timeZoneService.getTimeZone()).format("Do MMMM hh:mm a");
                    }
                    q.resolve(data.data.admin_friends_not_room_members);
                } else{
                    q.resolve(noRoomData);
                }
                
            });
             return q.promise;
         }
         return service;
     };
 })();