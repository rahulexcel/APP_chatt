 (function() {
     'use strict';

     angular.module('chattapp')
         .controller('chatPageController', chatPageController);

     function chatPageController($ionicHistory,$scope) {
      $scope.focusOut=function(){
          $scope.isFocused='focusOut'
      };
     }
 })();