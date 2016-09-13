(function() {
    'use strict';

    angular.module('chattapp')
            .controller('chatPageController', chatPageController);

    function chatPageController($ionicHistory, $scope, $localStorage, $rootScope) {
        $scope.focusOut = function() {
            $rootScope.isFocused = 'focusOut';
        };
        $scope.height = screen.height;
        if ($localStorage['bgImage']) {
            $scope.background = $localStorage['bgImage'];
        }
    }
})();