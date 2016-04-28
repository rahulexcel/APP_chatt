(function() {
   'use strict';

   angular.module('chattapp')

           .run(function($rootScope, $ionicPlatform, timeStorage, $interval, $state, Configurations, deviceService, pushNotification, lastUsesTimeService, $localStorage, sqliteService, geoLocation, $cordovaGeolocation) {
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
               $rootScope.$on('$stateChangeStart',
                       function(event, toState, toParams, fromState, fromParams, options) {
                           if (toState.name == "app.chatpage") {
                               $rootScope.show = true;
                           }
                           else {
                               $rootScope.show = false;
                           }
                       });
               window.socket = io(Configurations.socketApi);
               document.addEventListener("deviceready", function() {
                   //geoLocation.update();
                   timeStorage.set('deviceUUID', deviceService.getuuid(), 1);
                   timeStorage.set('devicePlatform', deviceService.platform(), 1);
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
                   if (navigator.connection.type != 'none') {
                       onOnline();
                   }
                   document.addEventListener("online", onOnline, false);
                   function onOnline() {
                       sqliteService.deviceIsNowOnline();
                       $rootScope.$broadcast('now_device_is_online', {data: ''});
                       timeStorage.remove('network');
                   }
                   document.addEventListener("offline", onOffline, false);
                   function onOffline() {
                        $rootScope.$broadcast('now_device_is_ofline', {data: ''});
                       timeStorage.set('network', 'offline', 24);
                   }
                   
               });
           });
})();