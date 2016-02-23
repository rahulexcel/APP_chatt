(function () {
    'use strict';

    angular.module('starter')
            .controller('loginController', loginController);

    function loginController($state, loginFactory, localStorageService, $localStorage, tostService, deviceService, googleLogin, facebookLogin) {
        console.log('login');
        this.data = {
            email: '',
            password: ''
        }
        // var deviceUUID = deviceService.getuuid();
        var deviceUUID = 'device_id';
        this.login = function () {
            console.log(this.data.email);
            console.log(this.data.password);
            var query = loginFactory.save({
                action_type: 'manual_login',
                social_id: '',
                platform: 'android',
                token: 'token',
                action: 'login_register',
                device_id: 'dsvfdff',
                email: this.data.email,
                password: this.data.password,
                name:''
            });
            query.$promise.then(function (data) {
                console.log(data);
                if(data.message == 'Please verify you account first'){
                    $state.go('verification');
                    localStorageService.set('userEmail',this.data.email);
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
                localStorageService.set('userEmail',googleData.email);
                    var query = loginFactory.save({
                        action_type:'google',
                        social_id:googleData.google_id,
                        platform:'android',
                        token:'AIzaSyCud3Ip685_VAzRB-b5KtTl3CpUKCGdezE',
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
                localStorageService.set('userEmail',fbData.email);
                var query = loginFactory.save({
                        action_type:'facebook',
                        social_id:fbData.id,
                        platform:'android',
                        token:'AIzaSyCud3Ip685_VAzRB-b5KtTl3CpUKCGdezE',
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
            }, function(data) {
                console.log(data);
            });
        };
        this.verifyAccount = function () {
           localStorageService.set('fromLoginPage', 'fromLoginPage');
           delete $localStorage.userEmail;
           $state.go('verification');
        };
    }
})();