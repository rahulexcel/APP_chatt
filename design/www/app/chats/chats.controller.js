 (function() {
    'use strict';

    angular.module('chattapp')
        .controller('chatsController', chatsController);

    function chatsController(chatsFactory, timeStorage) {
            var self = this;
            var userData = timeStorage.get('userData');
            var query = chatsFactory.save({
                 accessToken: userData.data.access_token,
                 timestamp:_.now(),
             });
             query.$promise.then(function(data) {
                console.log(data.data.rooms);
                 self.displayChats = data.data.rooms;
             });
    }
})();