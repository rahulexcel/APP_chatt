 (function() {
     'use strict';

     angular.module('starter')
         .controller('menuController', menuController);

     function menuController($scope, $ionicPopover) {
         console.log('menuController');
         var self = this;
         $ionicPopover.fromTemplateUrl('templates/popover.html', {
             scope: $scope,
         }).then(function(popover) {
             $scope.popover = popover;
         });
     }
 })();