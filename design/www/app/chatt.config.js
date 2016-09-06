(function() {
    'use strict';

angular.module('chattapp')

.config(function($ionicConfigProvider) {
    $ionicConfigProvider.backButton.previousTitleText(false).text(' ');
    $ionicConfigProvider.views.transition('none');
    $ionicConfigProvider.navBar.alignTitle('center');
});

})();