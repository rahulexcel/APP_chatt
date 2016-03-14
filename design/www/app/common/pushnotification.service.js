(function () {
    'use strict';
    angular.module('chattapp')
            .factory('pushNotification', pushNotification);
    function pushNotification($http, $q, $log,Configurations, timeStorage) {
        return {
            push: function () {
                console.log('push is calling');
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
                    if (undefined != data.additionalData.callback && 'function' == typeof window[data.additionalData.callback]) {
                        windowdata.additionalData.callback;
                    }
                    console.log(data);
                    if (data.additionalData.foreground) {
                        console.log(data);
                    } else {
                        data.message,
                            data.title,
                            data.count,
                            data.sound,
                            data.image,
                            data.additionalData
                    }
                    window.callbackName = function() {
                        console.log("Notification");
                    }
                });
                window.actions_left = function(data) {
                    $state.go('app.chatpage');
                };
                push.on('error', function(e) {
                    console.log("error");
                    console.log(e.message);
                });
            }
        };
    }

})();