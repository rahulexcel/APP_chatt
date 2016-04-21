 (function() {
    'use strict';

    angular.module('chattapp')
        .controller('addInGroupController', addInGroupController);

    function addInGroupController(timeStorage) {
        var self = this;
        self.displayaddInGroup = timeStorage.get('displayPrivateChats');
        self.addUser = function(index){
            self.clickRoomSpinner = index;
        }
    }
})();