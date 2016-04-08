(function() {
    'use strict';

    angular.module('chattapp')
            .controller('chatsController', chatsController);

    function chatsController($scope, $rootScope, chatsFactory,$ionicHistory, timeStorage, chatsService, $state, socketService) {
        var self = this;

        var userData = timeStorage.get('userData');
        chatsService.listMyRooms().then(function(data) {
            self.displayChats = data;
            $scope.$evalAsync();
        });
        self.displayChats = timeStorage.get('displayPrivateChats');
        $scope.$on('updatedRoomData', function(event, response) {
            self.displayChats = response.data;
            $scope.$evalAsync();
        });
        self.roomClick = function(roomData) {
            
            var clickRoomUserData = {
                "name": roomData.user_data.name,
                "id": roomData.user_data.id,
                "pic": roomData.user_data.profile_image,
                "lastSeen": roomData.user_data.last_seenInTimestamp
            }
            timeStorage.set('chatWithUserData', clickRoomUserData, 1);
            if (roomData.user_data.id) {
                socketService.create_room(roomData.user_data.id);
                $state.go('app.chatpage', {roomId: roomData.room_id});
            } else {
                socket.emit('room_open', roomData.room_id);
                $state.go('app.chatpage', {roomId: roomData.room_id});
            }
        }
    }
})();