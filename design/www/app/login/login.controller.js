(function() {
    'use strict';

    angular.module('chattapp')
        .controller('loginController', loginController);

    function loginController($state, loginFactory, timeStorage, $localStorage, tostService, deviceService, $timeout, $ionicHistory, googleLogin, facebookLogin, $ionicPlatform, lastUsesTimeService, $ionicLoading) {
        console.log('login');
        var self = this;
        self.data = {
            email: '',
            password: ''
        }
        var deviceUUID = timeStorage.get('deviceUUID');
        var devicePlatform = timeStorage.get('devicePlatform');
        self.login = function() {
            if (_.isEmpty(self.data.email) || _.isEmpty(self.data.password) || !self.data.email) {
                tostService.notify('Please enter your correct email and password', 'top');
            } else {
                $ionicLoading.show();
                var query = loginFactory.save({
                    action_type: 'manual_login',
                    social_id: '',
                    platform: devicePlatform,
                    token: $localStorage.gcmToken,
                    action: 'login_register',
                    device_id: deviceUUID,
                    email: self.data.email,
                    password: self.data.password,
                    name: '',
                    currentTimestamp: _.now(),
                    profile_image:''
                });
                query.$promise.then(function(data) {
                    $ionicLoading.hide();
                    if (data.status == 3) {
                        tostService.notify(data.message, 'top');
                        timeStorage.set('userEmail', self.data.email, 1);
                        $state.go('verification');
                    } else if (data.status == 1) {
                        tostService.notify('Welcome "'+data.data.name+'"', 'top');
                        timeStorage.set('userEmail', self.data.email, 1);
                        timeStorage.set('userData', data, 1);
                        // lastUsesTimeService.updateTime();
                        $state.go('app.chats');
                    } else if(data.status == 0){
                        tostService.notify(data.message, 'top');
                    }
                });
            }
        };

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
                    profile_image:googleData.picture
                });
                query.$promise.then(function(data) {
                    $ionicLoading.hide();
                    console.log(data);
                    tostService.notify('Welcome "'+data.data.name+'"', 'top');
                    timeStorage.set('userEmail', googleData.email, 1);
                    timeStorage.set('userData', data, 1);
                    // lastUsesTimeService.updateTime();
                    $state.go('app.chats');
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
                profile_image:'http://graph.facebook.com/' + fbData.id + '/picture?type=large'
            });
            query.$promise.then(function(data) {
                $ionicLoading.hide();
                console.log(data);
                tostService.notify('Welcome "'+data.data.name+'"', 'top');
                timeStorage.set('userEmail', fbData.email, 1);
                timeStorage.set('userData', data, 1);
                // lastUsesTimeService.updateTime();
                $state.go('app.chats');
            });
        };
        var count = 0;
        $ionicPlatform.registerBackButtonAction(function() {
            var view = $ionicHistory.currentView();
            if (view.stateId == 'login' && count == 0) {
                tostService.notify('Press Back Button Again To Exit The App!', 'center');
                count++;
                $timeout(function() {
                    count = 0;
                }, 3000);
            } else if (view.stateId == 'login' && count == 1) {
                navigator.app.exitApp();
                count = 0;
            } else {
                $ionicHistory.goBack();
                count = 0;
            }
        }, 100);

    }
})();