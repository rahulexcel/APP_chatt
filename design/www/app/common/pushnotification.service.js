(function () {
    'use strict';
    angular.module('chattapp')
            .factory('pushNotification', pushNotification);
    function pushNotification($http, $q, $log,Configurations, timeStorage, $state, $localStorage) {
        return {
            push: function () {
                console.log('push is calling');
                var flag = 0;
                    var push = PushNotification.init({
                    "android": {
                        "senderID": Configurations.senderID,
                        "icon": Configurations.icon,
                        "iconColor": "grey"
                    },
                    "ios": {
                        "alert": "true",
                        "badge": "true",
                        "sound": "true"
                    },
                    "windows": {}
                });
                push.on('registration', function(data) {
                    console.log(data.registrationId);
                    timeStorage.set('gcmToken',data.registrationId)
                });
                push.on('notification', function(data) {
                    if (data.additionalData.foreground) {
                        console.log(data);
                    } else {
                        // data.message,
                        //     data.title,
                        //     data.count,
                        //     data.sound,
                        //     data.image,
                        //     data.additionalData
                    }
                    if(data.additionalData.coldstart){
                        flag = 1;
                        var chatWithUser = {
                            name:data.title,
                            pic:data.additionalData.icon,
                        }
                        timeStorage.set('chatWithUserData', chatWithUser, 1);
                        $state.go('app.chatpage', {roomId:data.additionalData.room_id});
                    }
                });
                push.on('error', function(e) {
                    console.log(e.message);
                });
                if(flag == 0){
                     if($localStorage.userData){
                        $state.go('app.chats');
                        } else{
                        $state.go('login');
                     }
                }
            }
        };
    }
})();