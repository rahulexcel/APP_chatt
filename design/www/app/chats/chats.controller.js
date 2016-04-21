 (function() {
    'use strict';

    angular.module('chattapp')
        .controller('chatsController', chatsController);

    function chatsController($scope, chatsFactory, timeStorage, chatsService, $state, socketService, $interval, $ionicHistory, timeZoneService) {
            var self = this;
            var userData = timeStorage.get('userData');
             chatsService.listMyRooms().then(function(data){
                self.displayChats = data;
             });
             var displayChats = timeStorage.get('displayPrivateChats');
             for(var i=0; i < displayChats.length; i++){
                displayChats[i].unreadMessage = 0;
                displayChats[i].unreadMessageTimeStamp = 0;
             }
             self.displayChats = displayChats;
             $scope.$on('got_room_unread_notification', function (event, response) {
                chatsService.showUnreadIcon(response).then(function(data){
                    self.displayChats = data;
                    $scope.$evalAsync();
                    socketService.getUserProfile(self.displayChats);
                });
             });
             $scope.$on('update_room_unread_notification', function (event, response) {
             	socketService.update_room_unread_notification(response.data);
             });
             self.roomClick = function(roomData){
                var clickRoomUserData = {
                    "name":roomData.user_data.name,
                    "id":roomData.user_data.id,
                    "pic":roomData.user_data.profile_image,
                    "lastSeen":roomData.user_data.last_seenInTimestamp
                }
                timeStorage.set('chatWithUserData', clickRoomUserData, 1);
                if(roomData.user_data.id){
                    socketService.create_room(roomData.user_data.id);
                    $state.go('app.chatpage', {roomId:roomData.room_id});
                } else{
                    socket.emit('APP_SOCKET_EMIT', 'room_open', { accessToken: userData.data.access_token, room_id: roomData.room_id, currentTimestamp: _.now() });
                    $state.go('app.chatpage', {roomId:roomData.room_id});
                }
             }
             var getUserProfile = $interval(function() {
                if ($ionicHistory.currentView().stateName != 'app.chats') {
                    $interval.cancel(getUserProfile);
                } else {
                    socketService.getUserProfile(self.displayChats);
                }
             }, 60000);
             $scope.$on('got_user_updated_profile', function (event, response) {
                for(var i = 0; i < self.displayChats.length; i++){
                    if(self.displayChats[i].room_type == 'private'){
                        if(self.displayChats[i].user_data.id == response.data.user_id){
                            self.displayChats[i].user_data.status = response.data.data.data.status;
                            self.displayChats[i].user_data.last_seenInTimestamp = response.data.data.data.last_seen;
                            self.displayChats[i].user_data.last_seen = moment.unix(response.data.data.data.last_seen).tz(timeZoneService.getTimeZone()).format("Do MMMM hh:mm a");
                            $scope.$evalAsync();
                        }
                    }
                }
             });
    }
})();