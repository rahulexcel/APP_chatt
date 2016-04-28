(function() {
    'use strict';

    angular.module('chattapp')
            .controller('menuController', menuController);

    function menuController($scope, $ionicPopover, socketService, $ionicPlatform, $cordovaGeolocation, $ionicHistory, tostService, $localStorage, Onsuccess, $state, timeStorage, $rootScope) {

        var self = this;
        self.chattab = true;
        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope,
        }).then(function(popover) {
            self.popover = popover;
        });
        self.search = function(state) {
            
            if (timeStorage.get('network')) {
//                window.plugins.toast.showShortTop('You need to online to access this');
                $state.go(state);
            }
            else
            {
                if(state == 'app.contacts')
                {
                cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
                if(!enabled)
                {
                cordova.plugins.diagnostic.switchToLocationSettings();   
                }
                }, function(error) {
                //error
                });
                }
                $state.go(state);
            }
        };
        Onsuccess.footerTab(function(a, b, c, d) {
            self.chattab = a;
            self.searchb = b;
            self.setting = c;
            self.group = d;
        });
        $scope.logout = function() {
            window.sqlitePlugin.deleteDatabase({name: "chattappDB", location: 1});

            socketService.logout();
            timeStorage.remove('google_access_token');
            timeStorage.remove('userEmail');
            timeStorage.remove('userData');
            timeStorage.remove('displayPrivateChats');
            timeStorage.remove('listUsers');
            timeStorage.remove('chatWithUserData');
            timeStorage.remove('displayPublicChats');
            timeStorage.remove('profile_data');
            timeStorage.remove('bgImage');
            if (ionic.Platform.isAndroid()) {
                facebookConnectPlugin.logout();
            }
            ;
            $state.go('login');
        };

        var count = 0;
        $ionicPlatform.registerBackButtonAction(function() {
            var view = $ionicHistory.currentView();
            if (view.stateId == 'login' && count == 0 || view.stateId == 'app.chats' && count == 0) {
                tostService.notify('Press Back Button Again To Exit The App!', 'Bottom');
                count++;
                $timeout(function() {
                    count = 0;
                }, 3000);
            } else if (view.stateId == 'login' && count == 1 || view.stateId == 'app.chats' && count == 1) {
                navigator.app.exitApp();
                count = 0;
            } else {
                $ionicHistory.goBack();
                count = 0;
            }
        }, 100);
       
    
    }
})();