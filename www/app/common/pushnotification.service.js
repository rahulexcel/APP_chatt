(function() {
    'use strict';
    angular.module('chattapp')
            .factory('pushNotification', pushNotification);
    function pushNotification($http, $q, $log, Configurations, timeStorage, $state, $localStorage) {
        return {
            push: function() {
                var flag = 0;
                var android = {
                    "senderID": Configurations.senderID,
                    "icon": Configurations.icon,
                    "iconColor": "grey",
                    "forceShow": "true"
                }
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
                    timeStorage.set('gcmToken', data.registrationId)
                });
                push.on('notification', function(data) {
                  console.log('notification data', data);
                    if (data.additionalData.foreground) {
                    } else {
                        // data.message,
                        //     data.title,
                        //     data.count,
                        //     data.sound,
                        //     data.image,
                        //     data.additionalData
                    }
                    if (data.additionalData.coldstart) {
                        flag = 1;
                        if(data.title){
                             var chatWithUser = {
                                 name: data.title,
                                 pic: data.additionalData.icon,
                             }
                           } else{
                             var chatWithUser = {
                                 name: data.additionalData.title,
                                 pic: data.additionalData.icon,
                             }
                           }
                        timeStorage.set('chatWithUserData', chatWithUser, 1);
                        if (data.additionalData.room_id) {
                            $state.go('app.chatpage', {roomId: data.additionalData.room_id});
                        } else {
                            $state.go('app.chats');
                        }
                    } else {
                    if(data.title){
                         var chatWithUser = {
                             name: data.title,
                             pic: data.additionalData.icon,
                         }
                       } else{
                         var chatWithUser = {
                             name: data.additionalData.title,
                             pic: data.additionalData.icon,
                         }
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