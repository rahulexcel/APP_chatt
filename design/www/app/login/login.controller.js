(function() {
    'use strict';

    angular.module('chattapp')
            .controller('loginController', loginController);

    function loginController($state, loginFactory, timeStorage, $localStorage, tostService, deviceService, $timeout, $ionicHistory, googleLogin, facebookLogin, $ionicPlatform, lastUsesTimeService, $ionicLoading) {
        console.log('login');
        var self = this;
        
        var deviceUUID = timeStorage.get('deviceUUID');
        var devicePlatform = timeStorage.get('devicePlatform');
        

        self.googleRegister = function() {
            var promise = googleLogin.startLogin();
            promise.then(function(googleData) {
                $ionicLoading.show();
                console.log(googleData);
                timeStorage.set('userEmail', googleData.email, 1);
                var query = loginFactory.save({
                    action_type: 'google',
                    social_id: googleData.google_id,
                    platform: devicePlatform,
                    token: $localStorage.gcmToken,
                    action: 'login_register',
                    device_id: deviceUUID,
                    email: googleData.email,
                    name: googleData.name,
                    currentTimestamp: _.now(),
                    password: '',
                    profile_image: googleData.picture
                });
                query.$promise.then(function(data) {
                    $ionicLoading.hide();
                    console.log(data);
                    tostService.notify('Welcome "' + data.data.name + '"', 'top');
                    timeStorage.set('userEmail', googleData.email, 1);
                    timeStorage.set('userData', data, 1);
                    // lastUsesTimeService.updateTime();
                    $state.go('app.chats');
                    $ionicHistory.nextViewOptions({
                        historyRoot: true,
                        disableBack: true
                    });
                });
            }, function(data) {
                console.log(data);
            });
        };
        self.facebookRegister = function() {
            facebookLogin.login().then(function(fbData) {
                console.log(fbData);
                if (fbData.id) {
                    loginWithFBApi(fbData);
                    $ionicLoading.show();
                }
                if (fbData == 'unknown') {
                    facebookLogin.fbLoginSuccess().then(function(fbData1) {
                        console.log(fbData1);
                        loginWithFBApi(fbData1);
                        $ionicLoading.show();
                    }, function(data) {
                        console.log(data);
                    });
                }
            }, function(data) {
                console.log(data);
            });
        };

        function loginWithFBApi(fbData) {
            timeStorage.set('userEmail', fbData.email, 1);
            var query = loginFactory.save({
                action_type: 'facebook',
                social_id: fbData.id,
                platform: devicePlatform,
                token: $localStorage.gcmToken,
                action: 'login_register',
                device_id: deviceUUID,
                email: fbData.email,
                name: fbData.name,
                currentTimestamp: _.now(),
                password: '',
                profile_image: 'http://graph.facebook.com/' + fbData.id + '/picture?type=large'
            });
            query.$promise.then(function(data) {
                $ionicLoading.hide();
                console.log(data);
                tostService.notify('Welcome "' + data.data.name + '"', 'top');
                timeStorage.set('userEmail', fbData.email, 1);
                timeStorage.set('userData', data, 1);
                // lastUsesTimeService.updateTime();
                $state.go('app.chats');
                $ionicHistory.nextViewOptions({
                    historyRoot: true,
                    disableBack: true
                });
            });
        }
        ;
        

    }
})();