(function() {
    'use strict';

    angular.module('chattapp')

            .run(function($rootScope, $ionicPlatform, timeStorage, tostService, $state, Configurations, deviceService, pushNotification, lastUsesTimeService, $localStorage, sqliteService, $stateParams) {
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
                if ($localStorage.userData) {
                    $state.go('app.chats');
                } else {
                    $state.go('login');
                }
//                $rootScope.$on('$stateChangeStart',
//                        function(event, toState, toParams, fromState, fromParams, options) {
//                            console.log(toState);
//                          
//                  
//                            // transitionTo() promise will be rejected with 
//                            // a 'transition prevented' error
//                        })
                window.socket = io(Configurations.socketApi);

                document.addEventListener("deviceready", function() {
                    document.addEventListener("online", onOnline, false);
                    function onOnline() {
                        $rootScope.$broadcast('now_device_is_online', {data: ''});
                        timeStorage.remove('network');
                    }
                    document.addEventListener("offline", onOffline, false);
                    function onOffline() {
                        timeStorage.set('network', 'offline', 100);
                    }
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
                });


            });

})();