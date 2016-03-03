 (function() {
     'use strict';

     angular.module('starter')
         .controller('menuController', menuController);

     function menuController($scope, $ionicPopover, $localStorage, $state) {
         console.log('menuController');
         var self = this;
         $ionicPopover.fromTemplateUrl('templates/popover.html', {
             scope: $scope,
         }).then(function(popover) {
             self.popover = popover;
         });
         self.logout = function(){
            $localStorage.$reset();
            $state.go('login')
         }
     }
 })();