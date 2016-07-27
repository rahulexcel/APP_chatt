 (function() {
    'use strict';

    angular.module('chattapp')
        .controller('inviteInGroupController', inviteInGroupController);

    function inviteInGroupController(timeStorage, inviteInGroupService, socketService, $scope) {
        var self = this;
        self.loadingSpinner=true;
        inviteInGroupService.userlist().then(function(data){
            self.displayinviteInGroup = data;
            self.loadingSpinner=false;
        });
        self.inviteUser = function(ClickUserData, index){
            self.clickRoomSpinner = index;
            socketService.addInGroup(timeStorage.get('inviteInGroupId'), ClickUserData.id);
        }
        $scope.$on('admin_added_user_to_public_room', function (event, response) {
            self.clickRoomSpinner = -1;
            inviteInGroupService.userlist().then(function(data){
                self.displayinviteInGroup = data;
            });
         });
    }
})();