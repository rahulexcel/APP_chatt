(function () {
    'use strict';

    angular.module('starter')
            .controller('loginController', loginController);

    function loginController($state, loginFactory, timeStorage, $localStorage, tostService, deviceService, googleLogin, facebookLogin) {
        console.log('login');
        this.data = {
            email: '',
            password: ''
        }
        var deviceUUID = deviceService.getuuid();
        var devicePlatform = deviceService.platform();

        this.login = function () {
            var query = loginFactory.save({
                action_type: 'manual_login',
                social_id: '',
                platform: devicePlatform,
                token: $localStorage.gcmToken,
                action: 'login_register',
                device_id: deviceUUID,
                email: this.data.email,
                password: this.data.password,
                name:''
            });
            query.$promise.then(function (data) {
                console.log(data);
                if(data.message == 'Please verify you account first'){
                    $state.go('verification');
                    timeStorage.set('userEmail',this.data.email);
                    delete $localStorage.fromLoginPage;
                }
                tostService.notify(data.message, 'top');
                // $state.go('app.contacts');
            });
        };

        this.googleRegister = function(){
            this.googleSpinner = true;
            console.log('Attempting Google Login');
            var promise = googleLogin.startLogin();
            promise.then(function(googleData) {
                console.log(googleData);
                timeStorage.set('userEmail',googleData.email);
                    var query = loginFactory.save({
                        action_type:'google',
                        social_id:googleData.google_id,
                        platform:devicePlatform,
                        token:$localStorage.gcmToken,
                        action:'login_register',
                        device_id:deviceUUID,
                        email: googleData.email,
                        name: googleData.name
                    });
                    query.$promise.then(function(data) {
                        this.googleSpinner = false;
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
            this.facebookSpinner = true;
            facebookLogin.login().then(function(fbData){
                console.log(fbData);
                if(fbData.id){
                   loginWithFBApi(fbData);
                }
                if(fbData == 'unknown'){
                    facebookLogin.fbLoginSuccess().then(function(fbData1){
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
        function loginWithFBApi(fbData){
                timeStorage.set('userEmail',fbData.email);
                var query = loginFactory.save({
                        action_type:'facebook',
                        social_id:fbData.id,
                        platform:devicePlatform,
                        token:$localStorage.gcmToken,
                        action:'login_register',
                        device_id:deviceUUID,
                        email: fbData.email,
                        name: fbData.name
                    });
                    query.$promise.then(function(data) {
                        this.facebookSpinner = false;
                        console.log(data);
                        tostService.notify(data.message, 'top');
                        $state.go('app.contacts');
                    });
        };
        this.verifyAccount = function () {
           timeStorage.set('fromLoginPage', 'fromLoginPage');
           delete $localStorage.userEmail;
           $state.go('verification');
        };
    }
})();