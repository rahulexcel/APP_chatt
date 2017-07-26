 (function() {
     'use strict';

     angular.module('chattapp')

     .directive('chatPageFooter', function() {
         var directive = {};
         directive.restrict = 'E';
         directive.templateUrl = "app/chatpage/templates/footer.html";
         directive.controller = 'chatPageFooterDirectiveController';
         directive.controllerAs = 'chatPageFooter';
         directive.compile = function(element, attributes) {
             var linkFunction = function($scope, element, attributes) {}
             return linkFunction;
         }
         return directive;
     });
 })();