(function () {
    'use strict';

    angular.module('starter')
            .controller('loginController', loginController);

    function loginController($scope, $state, loginFactory, localStorageService, $localStorage, tostService, deviceService) {
        console.log('login');
        $scope.data = {
            email: '',
            password: ''
        }
        // var deviceUUID = deviceService.getuuid();
        var deviceUUID = 'device_id';
        $scope.login = function () {
//            $state.go('app.contacts');
            var query = loginFactory.save({
                action_type: 'manual',
                social_id: '',
                platform: 'android',
                token: 'token',
                action: 'login_register',
                device_id: deviceUUID,
                email: $scope.data.email,
                password: $scope.data.password
            });
            query.$promise.then(function (data) {
                console.log(data);
                tostService.notify(data.message, 'top');
                $state.go('app.contacts');
            });
        };
        $scope.verifyAccount = function () {
            if(localStorageService.get('userEmail')){
                $state.go('verification');
            } else{
                tostService.notify('Please Sign Up First', 'bottom');
            }
//            localStorageService.set('fromLoginPage', 'fromLoginPage');
//            delete $localStorage.userEmail;
//            $state.go('verification');
        };
    }
})();