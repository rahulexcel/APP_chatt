(function() {
    'use strict';

    angular.module('starter')
        .controller('loginController', loginController);

    function loginController($state, loginFactory, timeStorage, $localStorage, tostService, deviceService, $timeout, $ionicHistory, googleLogin, facebookLogin, $ionicPlatform) {
        console.log('login');
        var self = this;
        this.data = {
            email: '',
            password: ''
        }
        var currentTimestamp = _.now();
        var deviceUUID = deviceService.getuuid();
        var devicePlatform = deviceService.platform();
        this.login = function() {
            if (_.isEmpty(this.data.email) || _.isEmpty(this.data.password) || !this.data.email) {
                tostService.notify('Please enter your correct email and password', 'top');
            } else {
                var query = loginFactory.save({
                    action_type: 'manual_login',
                    social_id: '',
                    platform: devicePlatform,
                    token: $localStorage.gcmToken,
                    action: 'login_register',
                    device_id: deviceUUID,
                    email: this.data.email,
                    password: this.data.password,
                    name: '',
                    currentTimestamp: currentTimestamp
                });
                query.$promise.then(function(data) {
                    console.log(data);
                    tostService.notify(data.message, 'top');
                    if (data.status == 0) {
                        $state.go('verification');
                        timeStorage.set('userEmail', this.data.email, 1);
                    }
                    // $state.go('app.contacts');
                });
            }
        };

        this.googleRegister = function() {
            self.googleSpinner = true;
            console.log('Attempting Google Login');
            var promise = googleLogin.startLogin();
            promise.then(function(googleData) {
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
                    currentTimestamp: currentTimestamp
                });
                query.$promise.then(function(data) {
                    self.googleSpinner = false;
                    console.log(data);
                    tostService.notify(data.message, 'top');
                    $state.go('app.contacts');
                });
            }, function(data) {
                console.log(data);
            });
        };
        this.facebookRegister = function() {
            console.log('Attempting Facebook Login');
            self.facebookSpinner = true;
            facebookLogin.login().then(function(fbData) {
                console.log(fbData);
                if (fbData.id) {
                    loginWithFBApi(fbData);
                }
                if (fbData == 'unknown') {
                    facebookLogin.fbLoginSuccess().then(function(fbData1) {
                        console.log(fbData1);
                        loginWithFBApi(fbData1);
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
                currentTimestamp: currentTimestamp
            });
            query.$promise.then(function(data) {
                self.facebookSpinner = false;
                console.log(data);
                tostService.notify(data.message, 'top');
                $state.go('app.contacts');
            });
        };
        var count = 0;
        $ionicPlatform.registerBackButtonAction(function() {
            var view = $ionicHistory.currentView();
            console.log(view.stateId);
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