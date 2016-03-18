 (function() {
    'use strict';

    angular.module('chattapp')
        .controller('chatsController', chatsController);

    function chatsController(chatsFactory, timeStorage, chatsService, $state, socketService) {
            var self = this;
            var userData = timeStorage.get('userData');
            var query = chatsFactory.save({
                 accessToken: userData.data.access_token,
                 timestamp:_.now(),
             });
             query.$promise.then(function(data) {
                self.displayChats = chatsService.privateRooms(data.data.rooms);
             });
             self.roomClick = function(roomData){
                var clickRoomUserData = {
                    "name":roomData.user_data.name,
                    "id":roomData.user_data.id,
                    "pic":roomData.user_data.profile_image
                }
                timeStorage.set('chatWithUserData', clickRoomUserData, 1);
                socketService.create_room(roomData.user_data.id);
                $state.go('app.chatpage', {roomId:roomData.room_id});
             }
    }
})();