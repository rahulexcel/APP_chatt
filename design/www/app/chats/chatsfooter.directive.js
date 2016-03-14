 (function() {
     'use strict';

     angular.module('chattapp')

     .directive('chatsFooter', function() {
         var directive = {};
         directive.restrict = 'E';
         directive.templateUrl = "app/chats/templates/footer.html";
         directive.scope = {
             chatsFooter: "=footer"
         }
         directive.compile = function(element, attributes) {
             var linkFunction = function($scope, element, attributes) {}
             return linkFunction;
         }
         return directive;
     });
 })();