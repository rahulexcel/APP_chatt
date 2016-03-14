 (function() {
     'use strict';

     angular.module('chattapp')

     .directive('chatPageHeader', function() {
         var directive = {};
         directive.restrict = 'E';
         directive.templateUrl = "app/chatpage/templates/header.html";
         directive.scope = {
             chatPage: "=header"
         }
         directive.compile = function(element, attributes) {
             var linkFunction = function($scope, element, attributes) {}
             return linkFunction;
         }
         return directive;
     });
 })();