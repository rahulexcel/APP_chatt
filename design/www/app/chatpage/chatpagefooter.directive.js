 (function() {
     'use strict';

     angular.module('starter')

     .directive('chatPageFooter', function() {
         var directive = {};
         directive.restrict = 'E';
         directive.templateUrl = "app/chatpage/templates/footer.html";
         directive.scope = {
             chatPageFooter: "=footer"
         }
         directive.compile = function(element, attributes) {
             var linkFunction = function($scope, element, attributes) {}
             return linkFunction;
         }
         return directive;
     });
 })();