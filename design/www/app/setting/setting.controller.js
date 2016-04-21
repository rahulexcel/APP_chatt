(function() {
    'use strict';

    angular.module('chattapp')
            .controller('settingController', settingController);

    function settingController(socketService, timeStorage, $state) {
        var self = this;
//        self.version='';
        document.addEventListener("deviceready", function() {
            self.version = AppVersion.version;
        });
        self.logout = function() {
            socketService.logout();
            timeStorage.remove('google_access_token');
            timeStorage.remove('userEmail');
            timeStorage.remove('userData');
            timeStorage.remove('displayPrivateChats');
            timeStorage.remove('listUsers');
            timeStorage.remove('chatWithUserData');
            timeStorage.remove('displayPublicChats');
            timeStorage.remove('profile_data');
            $state.go('login');
        };
    }
})();