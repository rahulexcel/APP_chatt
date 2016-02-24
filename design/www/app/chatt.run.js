(function() {
    'use strict';

    angular.module('starter')

    .run(function($ionicPlatform, timeStorage, $state, Configurations, deviceService, pushNotification) {
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


        document.addEventListener("deviceready", function() {
            console.log("device uuid: " + deviceService.getuuid());
            pushNotification.push();
        });


    });

})();