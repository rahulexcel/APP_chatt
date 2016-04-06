(function() {
    'use strict';

    angular.module('chattapp')
            .controller('menuController', menuController);

    function menuController($scope, $ionicPopover, tostService, $localStorage, $state, timeStorage, $rootScope) {
        console.log('menuController');
        var self = this;

        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope,
        }).then(function(popover) {
            self.popover = popover;
        });
        $scope.search = function(state) {
            if (timeStorage.get('network')) {
                window.plugins.toast.showShortTop('You need to online to access this');
            }
            else
            {
                $state.go(state);
            }
        };
        self.logout = function() {
            timeStorage.remove('google_access_token');
            timeStorage.remove('userEmail');
            timeStorage.remove('userData');
            timeStorage.remove('displayPrivateChats');
            timeStorage.remove('listUsers');
            timeStorage.remove('chatWithUserData');
            timeStorage.remove('displayPublicChats');
            $state.go('login');
        };
    }
})();