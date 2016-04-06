(function() {
    'use strict';

    angular.module('chattapp')

    .run(function($rootScope, $ionicPlatform, timeStorage, $state, Configurations, deviceService, pushNotification, lastUsesTimeService, $localStorage, sqliteService) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
        window.socket = io(Configurations.socketApi);
        document.addEventListener("deviceready", function() {
            timeStorage.set('deviceUUID', deviceService.getuuid(),1);
            timeStorage.set('devicePlatform', deviceService.platform(),1);
            pushNotification.push();
            sqliteService.createTable();
            // lastUsesTimeService.updateTimeWithHttp();
            document.addEventListener("pause", onPause, false);
            document.addEventListener("resume", onResume, false);
            function onPause() {
                // lastUsesTimeService.updateTime();
            }
            function onResume() {
                // lastUsesTimeService.updateTime();
            }
            if(navigator.connection.type != 'none'){
                onOnline();
            }
            document.addEventListener("online", onOnline, false);
             function onOnline() {
                $rootScope.$broadcast('now_device_is_online', { data: '' });
                timeStorage.remove('network');
                sqliteService.deviceIsNowOnline();
             }
             document.addEventListener("offline", onOffline, false);
                function onOffline() {
                   timeStorage.set('network', 'offline', 24);
             }
        });
     });
})();