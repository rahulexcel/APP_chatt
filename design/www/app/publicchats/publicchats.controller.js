 (function() {
    'use strict';

    angular.module('chattapp')
        .controller('publicChatsController', publicChatsController);

    function publicChatsController($ionicModal, $scope, socketService, tostService, publicChatService, timeStorage, $state, publicChatFactory) {
        var self = this;
        self.displayPublicChat = timeStorage.get('displayPublicChats');
        publicChatService.listRooms();
        self.createGroup = function(){
            if(self.groupName && self.groupDescription){
                var userData = timeStorage.get('userData');
                var query = publicChatFactory.save({
                    accessToken: userData.data.access_token,
                    room_type: 'public',
                    chat_with: '',
                    room_name: self.groupName,
                    room_description: self.groupDescription,
                    currentTimestamp: _.now()
                });
                query.$promise.then(function(data) {
                    if(data.data.room_id){
                        tostService.notify(data.message, 'top');
                        publicChatService.listRooms();
                        $scope.modal.hide();
                    }
                });
            } else{
                tostService.notify('Please fill details', 'top');
            }
        }
        $scope.$on('updatedDisplayPublicChats', function (event, response) {
            self.displayPublicChat = response.data;
            $scope.$evalAsync();
         });
        self.clickOnRoom = function(roomData){
            var groupData = {
                "name": roomData.room_name,
                "id": roomData.id,
                "pic":roomData.room_background,
                "lastSeen":false
            }
            timeStorage.set('chatWithUserData', groupData, 1);
            socket.emit('room_open', roomData.id);
            $state.go('app.chatpage', {roomId:roomData.id});
        }
    $ionicModal.fromTemplateUrl('modal.html', function($ionicModal) {
        $scope.modal = $ionicModal;
        }, {
            scope: $scope,
        }); 
    }
})();