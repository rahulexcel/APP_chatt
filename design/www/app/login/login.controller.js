(function() {
    'use strict';

    angular.module('chattapp')
            .controller('loginController', loginController);

    function loginController($state, loginFactory, timeStorage,sqliteService, $localStorage, tostService, deviceService, $timeout, $ionicHistory, googleLogin, facebookLogin, $ionicPlatform, lastUsesTimeService, $ionicLoading) {
        var self = this;
        var deviceUUID = timeStorage.get('deviceUUID');
        var devicePlatform = timeStorage.get('devicePlatform');
        self.googleRegister = function() {
            var promise = googleLogin.startLogin();
            promise.then(function(googleData) {
                $ionicLoading.show();
                googleLogin.getUserFullDetails(googleData.google_id).then(function(userFullDetails){
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
                        profile_image: googleData.picture,
                        gender:googleData.gender,
                        dob:userFullDetails.birthday
                    });
                    query.$promise.then(function(data) {
                       sqliteService.createTable();
                        $ionicLoading.hide();
                        tostService.notify('Welcome "' + data.data.name + '"', 'top');
                        timeStorage.set('userEmail', googleData.email, 1);
                        timeStorage.set('userData', data, 1);
                        $state.go('app.chats');
                        $ionicHistory.nextViewOptions({
                            historyRoot: true,
                            disableBack: true
                        });
                    },function(error) {
                    tostService.notify('Error Occured . Try Again !!!', 'top'); 
                    });
                });
            }, function(data) {
                
            });
        };
        self.facebookRegister = function() {
            facebookLogin.login().then(function(fbData) {
                if (fbData.id) {
                    loginWithFBApi(fbData);
                    $ionicLoading.show();
                }
                if (fbData == 'unknown') {
                    facebookLogin.fbLoginSuccess().then(function(fbData1) {
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
                profile_image: 'http://graph.facebook.com/' + fbData.id + '/picture?type=large',
                gender:fbData.gender,
                dob:''
            });
            query.$promise.then(function(data) {
                sqliteService.createTable();
                $ionicLoading.hide();
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