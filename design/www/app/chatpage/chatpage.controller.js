(function() {
    'use strict';

    angular.module('chattapp')
            .controller('chatPageController', chatPageController);

    function chatPageController($ionicHistory, $scope, $localStorage) {
        $scope.focusOut = function() {
            $scope.isFocused = 'focusOut'
        };
        $scope.height = screen.height;
        if ($localStorage['bgImage']) {
            $scope.background = $localStorage['bgImage'];
        }
    }
})();