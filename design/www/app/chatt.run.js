(function() {
    'use strict';

    angular.module('chattapp')

    .run(function($ionicPlatform, timeStorage, $state, Configurations, deviceService, pushNotification, lastUsesTimeService, $localStorage, sqliteService) {
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
        if($localStorage.userData){
            $state.go('app.contacts');
        } else{
            $state.go('login');
        }
        window.socket = io(Configurations.socketApi);
        document.addEventListener("deviceready", function() {
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
        });


    });

})();