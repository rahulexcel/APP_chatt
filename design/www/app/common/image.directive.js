 (function() {
     'use strict';

     angular.module('chattapp')
         .directive('img', function($timeout) {
             return {
                 restrict: 'E',
                 link: function(scope, element, attr) {
                     if (attr.ngSrc == '') {
                         if (scope.contact) {
                             var name = scope.contact.name;
                             var firstLetter = name.charAt(0).toUpperCase();
                         }
                         if(scope.chat){
                             var name = scope.chat.name;
                             var firstLetter = name.charAt(0).toUpperCase();
                         }
                         if(scope.chatPage){
                             var name = scope.chatPage.name;
                             var firstLetter = name.charAt(0).toUpperCase();
                         }
                         var colorClass = Math.floor((Math.random() * 10) + 1);
                         element.replaceWith("<button class='no-image circleColor"+colorClass+"'><i class='i-24 white'>" + firstLetter + "</i><div class='md-ripple-container'></div></button>");
                     }
                 }
             }
         });
 })();