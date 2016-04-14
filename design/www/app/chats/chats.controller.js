 (function() {
    'use strict';

    angular.module('chattapp')
        .controller('chatsController', chatsController);

    function chatsController($scope, chatsFactory, timeStorage, chatsService, $state, socketService) {
            var self = this;
            var userData = timeStorage.get('userData');
             chatsService.listMyRooms();
             var displayChats = timeStorage.get('displayPrivateChats');
             for(var i=0; i < displayChats.length; i++){
                displayChats[i].unreadMessage = false;
             }
             self.displayChats = displayChats;
             $scope.$on('got_room_unread_notification', function (event, response) {
                chatsService.showUnreadIcon(response).then(function(data){
                    self.displayChats = data;
                    $scope.$evalAsync();
                });
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
    }
})();