(function() {
    'use strict';

    angular.module('chattapp')
            .directive('img', function($timeout,Configurations) {
                return {
                    restrict: 'E',
                    link: function(scope, element, attr) {
                        if (attr.ngSrc == '') {
                            var chatPageClass = '';
                            if (scope.contact) {
                                var name = scope.contact.name;
                                var firstLetter = name.charAt(0).toUpperCase();
                            }
                            if (scope.chatPageHeader) {
                                chatPageClass = 'chatPageheader';
                                var name = scope.chatPageHeader.name;
                                var firstLetter = name.charAt(0).toUpperCase();
                            }
                            if (scope.chatPageFooter) {
                                chatPageClass = 'chatPageheader';
                                var name = scope.chatPageFooter.name;
                                var firstLetter = name.charAt(0).toUpperCase();
                            }
                            if (scope.chat) {
                                var name = scope.chat.user_data.name;
                                var firstLetter = name.charAt(0).toUpperCase();
                            }
                            if (scope.publicChat) {
                                var name = scope.publicChat.room_name;
                                var firstLetter = name.charAt(0).toUpperCase();
                            }
                            if (scope.groupUser) {
                                var name = scope.groupUser.name;
                                var firstLetter = name.charAt(0).toUpperCase();
                            }
                            if (scope.msg) {
                                var name = scope.msg.name;
                                var firstLetter = name.charAt(0).toUpperCase();
                            }
                            if(scope.infoUser){
                                var name = scope.infoUser.name;
                                var firstLetter = name.charAt(0).toUpperCase();
                            }
                            if(scope.infoUser1){
                                var name = scope.infoUser1.name;
                                var firstLetter = name.charAt(0).toUpperCase();
                            }
                            if(scope.roomList){
                                var name = scope.roomList.user_data.name;
                                var firstLetter = name.charAt(0).toUpperCase();
                            }
                            if(scope.user){
                                var name = scope.user.user_data.name;
                                var firstLetter = name.charAt(0).toUpperCase();
                            }
                            var color = Configurations.color;
                            element.replaceWith("<button style='background:" + color[firstLetter.toLowerCase()] + "' class='no-image " + chatPageClass + "'><i class='white'>" + firstLetter + "</i><div class='md-ripple-container'></div></button>");
                        }
                    }
                }
            });
})();