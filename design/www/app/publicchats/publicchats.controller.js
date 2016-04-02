 (function() {
    'use strict';

    angular.module('chattapp')
        .controller('publicChatsController', publicChatsController);

    function publicChatsController($ionicModal, $scope, socketService, tostService, publicChatService, timeStorage) {
        var self = this;
        self.displayPublicChat = timeStorage.get('displayPublicChats');
        publicChatService.listRooms();
        self.createGroup = function(){
            if(self.groupName && self.groupDescription){
                socketService.create_public_room(self.groupName, self.groupDescription).then(function(resopnse){
                    tostService.notify(resopnse.message, 'top');
                    publicChatService.listRooms();
                    self.displayPublicChat = timeStorage.get('displayPublicChats');
                    $scope.modal.hide();
                });
            } else{
                tostService.notify('Please fill details', 'top');
            }
        }
    $ionicModal.fromTemplateUrl('modal.html', function($ionicModal) {
        $scope.modal = $ionicModal;
        }, {
            scope: $scope,
        }); 
    }
})();