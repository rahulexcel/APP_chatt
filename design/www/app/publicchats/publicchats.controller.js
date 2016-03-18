 (function() {
    'use strict';

    angular.module('chattapp')
        .controller('publicChatsController', publicChatsController);

    function publicChatsController($ionicModal, $scope) {
            var self = this;

    // Load the modal from the given template URL
    $ionicModal.fromTemplateUrl('modal.html', function($ionicModal) {
        $scope.modal = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $scope,
        // The animation we want to use for the modal entrance
        // animation: 'slide-in-up'
    }); 
    }
})();