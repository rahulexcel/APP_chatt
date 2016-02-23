(function () {
    'use strict';

    angular.module('starter')
            .controller('loginController', loginController);

    function loginController($scope, $state, loginFactory, localStorageService, $localStorage, tostService, deviceService, googleLogin, facebookLogin) {
        console.log('login');
        $scope.data = {
            email: '',
            password: ''
        }
        // var deviceUUID = deviceService.getuuid();
        var deviceUUID = 'device_id';
        $scope.login = function () {
            $state.go('app.contacts');
            var query = loginFactory.save({
                action_type: 'manual_login',
                social_id: '',
                platform: 'android',
                token: 'token',
                action: 'login_register',
                device_id: 'dsvfdff',
                email: $scope.data.email,
                password: $scope.data.password,
                name:''
            });
            query.$promise.then(function (data) {
                console.log(data);
                if(data.message == 'Please verify you account first'){
                    $state.go('verification');
                    localStorageService.set('userEmail',$scope.data.email);
                    delete $localStorage.fromLoginPage;
                }
                tostService.notify(data.message, 'top');
                // $state.go('app.contacts');
            });
        };

        $scope.googleRegister = function(){
            $scope.googleSpinner = true;
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
                        $scope.googleSpinner = false;
                        console.log(data);
                        tostService.notify(data.message, 'top');
                        $state.go('app.contacts');
                    });
            }, function(data) {
                console.log(data);
            });
        };
        $scope.facebookRegister = function() {
            console.log('Attempting Facebook Login');
            $scope.facebookSpinner = true;
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
                        $scope.facebookSpinner = false;
                        console.log(data);
                        tostService.notify(data.message, 'top');
                        $state.go('app.contacts');
                    });
            }, function(data) {
                console.log(data);
            });
        };
        $scope.verifyAccount = function () {
            // if(localStorageService.get('userEmail')){
            //     $state.go('verification');
            // } else{
            //     tostService.notify('Please Sign Up First', 'bottom');
            // }
           localStorageService.set('fromLoginPage', 'fromLoginPage');
           delete $localStorage.userEmail;
           $state.go('verification');
        };
    }
})();