(function() {
   'use strict';
   angular.module('chattapp')
           .factory('chatsService', chatsService);

   function chatsService($q, timeStorage, chatsFactory, $rootScope, timeZoneService, socketService) {
              var service = {};
               service.privateRooms = function(roomData, callback) {
                   var returnData = [];
                   for (var i = 0; i < roomData.length; i++) {
                       var newRoomData = {};
                       var room_users = {};
                       if (roomData[i].room_type == "public") {
                           room_users.last_seen = roomData[i].show_details_for_list.sub_text;
                           room_users.last_seenInTimestamp = roomData[i].show_details_for_list.sub_text;
                       } else {
                           room_users.last_seenInTimestamp = roomData[i].show_details_for_list.sub_text;
                           room_users.last_seen = moment.unix(roomData[i].show_details_for_list.sub_text).tz(timeZoneService.getTimeZone()).format("Do MMM hh:mm a");
                       }
                       room_users.profile_image = roomData[i].show_details_for_list.icon;
                       room_users.name = roomData[i].show_details_for_list.main_text;
                       room_users.id = roomData[i].show_details_for_list.user_id;
                       room_users.status = roomData[i].show_details_for_list.user_status;
                       room_users.geo_city=roomData[i].show_details_for_list.geo_city;
                       room_users.geo_state=roomData[i].show_details_for_list.geo_state;
                       room_users.distance=roomData[i].show_details_for_list.distance_from_logged_user;
                       newRoomData.user_data = room_users;
                       newRoomData.room_id = roomData[i].id;
                       newRoomData.room_type = roomData[i].room_type;
                       newRoomData.unreadMessage = 0;
                       newRoomData.unreadMessageTimeStamp = 0;
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
                               socketService.room_unread_notification(res);
                               timeStorage.set('displayPrivateChats', res, 1);
                               q.resolve(res);
                           });
                       } else {
                           timeStorage.set('displayPrivateChats', NoRoomData, 1);
                           q.resolve(NoRoomData);
                       }
                   });
                   return q.promise;
               },
               service.showUnreadIcon = function(roomUnreadData) {
                var allChatData = timeStorage.get('displayPrivateChats');
                var q = $q.defer();
                  for(var i = 0; i < allChatData.length; i++){
                    if(allChatData[i].room_id == roomUnreadData.data.room_id){
                      allChatData[i].unreadMessage = roomUnreadData.data.unread_messages;
                      allChatData[i].unreadMessageTimeStamp = roomUnreadData.data.currentTimestamp;
                    }
                  }
                  timeStorage.set('displayPrivateChats', allChatData, 1);
                  q.resolve(allChatData);
                  return q.promise;
               }
       return service;
   }
   ;

})();