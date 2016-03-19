 (function() {
    'use strict';

    angular.module('chattapp')
        .controller('chatsController', chatsController);

    function chatsController($scope, chatsFactory, timeStorage, chatsService, $state, socketService) {
            var self = this;
            var userData = timeStorage.get('userData');
            chatsService.listMyRooms();
            self.displayChats = timeStorage.get('displayPrivateChats');
            $scope.$on('updatedRoomData', function (event, response) {
                self.displayChats = response.data;
                $scope.$evalAsync();
             });
            if(!self.displayChats){
                chatsService.listMyRooms().then(function(data){
                    self.displayChats= data;
                });
            }
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