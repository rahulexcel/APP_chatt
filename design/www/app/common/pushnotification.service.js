(function() {
    'use strict';
    angular.module('chattapp')
            .factory('pushNotification', pushNotification);
    function pushNotification($http, $q, $log, Configurations, timeStorage, $state, $localStorage) {
        return {
            push: function() {
                console.log('push is calling');
                var flag = 0;
                var android = {
                    "senderID": Configurations.senderID,
                    "icon": Configurations.icon,
                    "iconColor": "grey",
                    "forceShow": "true"
                }
                console.log(android);
                var push = PushNotification.init({
                    "android": android,
                    "ios": {
                        "alert": "true",
                        "badge": "true",
                        "sound": "true"
                    },
                    "windows": {}
                });
                push.on('registration', function(data) {
                    console.log(data.registrationId);
                    timeStorage.set('gcmToken', data.registrationId)
                });
                push.on('notification', function(data) {
                    console.log('notification');
                    if (data.additionalData.foreground) {
                        console.log(data);
                    }
                    if (data.additionalData.coldstart) {
                        flag = 1;
                        var chatWithUser = {
                            name: data.title,
                            pic: data.additionalData.icon,
                        }
                        timeStorage.set('chatWithUserData', chatWithUser, 1);
                        if (data.additionalData.room_id) {
                            $state.go('app.chatpage', {roomId: data.additionalData.room_id});
                        } else {
                            $state.go('app.chats');
                        }
                    } else {
                        var chatWithUser = {
                            name: data.title,
                            pic: data.additionalData.icon,
                        }
                        timeStorage.set('chatWithUserData', chatWithUser, 1);
                        if (data.additionalData.room_id) {
                            $state.go('app.chatpage', {roomId: data.additionalData.room_id});
                        } else {
                            $state.go('app.chats');
                        }
                    }
                });
                push.on('error', function(e) {
                    console.log(e.message);
                });
                if (flag == 0) {
                    if ($localStorage.userData) {
                        $state.go('app.chats');
                    } else {
                        $state.go('login');
                    }
                }
            }
        };
    }
})();