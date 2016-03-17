 (function() {
     'use strict';

     angular.module('chattapp')
         .directive('img', function($timeout) {
             return {
                 restrict: 'E',
                 link: function(scope, element, attr) {
                     if (attr.ngSrc == '') {
                        var chatPageClass = '';
                         if (scope.contact) {
                             var name = scope.contact.name;
                             var firstLetter = name.charAt(0).toUpperCase();
                         }
                         if(scope.chat){
                             var name = scope.chat.name;
                             var firstLetter = name.charAt(0).toUpperCase();
                         }
                         if(scope.chatPage){
                            var name = '';
                            chatPageClass = 'chatPageheader';
                             if(scope.chatPage.displayChatMessages){
                                name = scope.msg.name;
                                // name = scope.chatPage.displayChatMessages[0].name;
                                var firstLetter = name.charAt(0).toUpperCase();
                             } else{
                             name = scope.chatPage.name;
                             var firstLetter = name.charAt(0).toUpperCase();
                             }
                         }
                         if(scope.chatPageFooter){
                            var name = scope.chatPageFooter.name;
                            var firstLetter = name.charAt(0).toUpperCase();
                            chatPageClass = 'chatPagefooter';
                         }
                         var colorClass = Math.floor((Math.random() * 10) + 1);
                         element.replaceWith("<button class='no-image circleColor"+colorClass+" "+chatPageClass+"'><i class='i-24 white'>" + firstLetter + "</i><div class='md-ripple-container'></div></button>");
                     }
                 }
             }
         });
 })();