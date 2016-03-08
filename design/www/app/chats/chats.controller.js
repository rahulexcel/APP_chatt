 (function() {
    'use strict';

    angular.module('starter')
        .controller('chatsController', chatsController);

    function chatsController(chatsFactory, timeStorage) {
            var self = this;
            var userData = timeStorage.get('userData');
            var query = chatsFactory.query({
                 access_token: userData.data.access_token,
                 timestamp:_.now(),
                 limit: 10,
                 page: 0
             });
             query.$promise.then(function(data) {
                 self.displayChats = data;
             });
    }
})();