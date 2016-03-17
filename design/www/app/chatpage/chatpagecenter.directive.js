 (function() {
     'use strict';

     angular.module('chattapp')

     .directive('chatPageCenter', function() {
         var directive = {};
         directive.restrict = 'E';
         directive.templateUrl = "app/chatpage/templates/center.html";
         directive.controller = 'chatPageCenterDirectiveController';
         directive.controllerAs = 'chatPageCenter';
         directive.compile = function(element, attributes) {
             var linkFunction = function($scope, element, attributes) {}
             return linkFunction;
         }
         return directive;
     });
 })();