(function() {
    'use strict';
    angular.module('chattapp')
            .factory('chatsService', chatsService);

    function chatsService($q, timeStorage, chatsFactory, $rootScope, timeZoneService) {
        var service = {};

        service.privateRooms = function(roomData, callback) {
            var returnData = [];
            for (var i = 0; i < roomData.length; i++) {
                var newRoomData = {};
                if (roomData[i].room_type == "public") {
                    roomData[i].room_users.last_seen = roomData[i].show_details_for_list.sub_text;
                } else {
                    roomData[i].room_users.last_seenInTimestamp = roomData[i].show_details_for_list.sub_text;
                    roomData[i].room_users.last_seen = moment(parseInt(roomData[i].show_details_for_list.sub_text)).format("Do MMMM hh:mm a");
                }
                roomData[i].room_users.profile_image = roomData[i].show_details_for_list.icon;
                roomData[i].room_users.name = roomData[i].show_details_for_list.main_text;
                newRoomData.user_data = roomData[i].room_users;
                newRoomData.user_data.roomType = '';
                newRoomData.room_id = roomData[i].id;
                returnData.push(newRoomData);
            }
            if (callback) {
                callback(returnData)
            }
        },
                service.listMyRooms = function() {
                    var q = $q.defer();
                    var userData = timeStorage.get('userData');
                    var query = chatsFactory.save({
                        accessToken: userData.data.access_token,
                        room_type: 'all',
                        timestamp: _.now(),
                    });
                    query.$promise.then(function(data) {
                        var NoRoomData = [];
                        if (data.data.rooms) {
                            service.privateRooms(data.data.rooms, function(res) {
                                timeStorage.set('displayPrivateChats', res, 1);
                                $rootScope.$broadcast('updatedRoomData', {data: res});
                                q.resolve(res);
                            });
                        } else {
                            timeStorage.set('displayPrivateChats', NoRoomData, 1);
                            q.resolve(NoRoomData);
                        }
                    });
                    return q.promise;
                }
        return service;
    };

})();