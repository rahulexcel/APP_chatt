 (function() {
    'use strict';

    angular.module('chattapp')
        .controller('inviteInGroupController', inviteInGroupController);

    function inviteInGroupController(timeStorage) {
        var self = this;
        self.displayinviteInGroup = timeStorage.get('displayPrivateChats');
        self.inviteUser = function(index){
            self.clickRoomSpinner = index;
        }
    }
})();