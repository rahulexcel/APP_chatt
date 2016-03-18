 (function() {
     'use strict';

     angular.module('chattapp')
         .controller('menuController', menuController);

     function menuController($scope, $ionicPopover, $localStorage, $state, timeStorage) {
         console.log('menuController');
         var self = this;
         $ionicPopover.fromTemplateUrl('templates/popover.html', {
             scope: $scope,
         }).then(function(popover) {
             self.popover = popover;
         });
         self.logout = function(){
            timeStorage.remove('google_access_token');
            timeStorage.remove('userEmail');
            timeStorage.remove('userData');
            $state.go('login');
         }
     }
 })();