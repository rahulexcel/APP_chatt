(function() {
    'use strict';

    angular.module('chattapp')
            .controller('loginController', loginController);

    function loginController($state, loginFactory, timeStorage, sqliteService, $localStorage, tostService,$ionicHistory, googleLogin, facebookLogin, $ionicLoading, loginService, guestloginFactory, $ionicModal, $scope, contactsFactory, socketService) {
        var self = this;
        var deviceUUID = timeStorage.get('deviceUUID');
        var devicePlatform = timeStorage.get('devicePlatform');
       
        self.googleRegister = function() {
            loginService.EULA().then(function(){
                var promise = googleLogin.startLogin();
                promise.then(function(googleData) {
                    $ionicLoading.show();
                    googleLogin.getUserFullDetails(googleData.google_id).then(function(userFullDetails) {
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
                            gender: googleData.gender,
                            dob: userFullDetails.birthday
                        });
                        query.$promise.then(function(data) {
                            sqliteService.createTable();
                            $ionicLoading.hide();
                            tostService.notify('Welcome "' + data.data.name + '"', 'top');
                            timeStorage.set('userEmail', googleData.email, 1);
                            timeStorage.set('userData', data, 1);
                            timeStorage.set('guest', false, 1);
                            $state.go('app.chats');
                            $ionicHistory.nextViewOptions({
                                historyRoot: true,
                                disableBack: true
                            });
                            loginService.createEchoUserRoom();
                        }, function(error) {
                            tostService.notify('Error Occured . Try Again !!!', 'top');
                        });
                    });
                }, function(data) {

                });
            });
        };
        self.facebookRegister = function() {
             loginService.EULA().then(function(){
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
                profile_image: 'https://graph.facebook.com/' + fbData.id + '/picture?type=large',
                gender: fbData.gender,
                dob: ''
            });
            query.$promise.then(function(data) {
                sqliteService.createTable();
                $ionicLoading.hide();
                tostService.notify('Welcome "' + data.data.name + '"', 'top');
                timeStorage.set('userEmail', fbData.email, 1);
                timeStorage.set('userData', data, 1);
                timeStorage.set('guest', false, 1);
                // lastUsesTimeService.updateTime();
                $scope.startChattModel.show();
                for (var i = 0; i < fbData.friends.data.length; i++) {
                    fbData.friends.data[i].checked = false;
                }
                $scope.friends = fbData.friends.data;
                // $state.go('app.chats');
                $ionicHistory.nextViewOptions({
                    historyRoot: true,
                    disableBack: true
                });
                loginService.createEchoUserRoom();
            });
        }
        ;
        self.guestLogin = function() {
            $ionicLoading.show();
            // timeStorage.set('userEmail', googleData.email, 1);
            var query = guestloginFactory.save({
                action_type: 'google',
                social_id: '123456789',
                platform: devicePlatform,
                token: $localStorage.gcmToken,
                action: 'guest_login',
                device_id: deviceUUID,
                email: '',
                name: '',
                currentTimestamp: _.now(),
                password: '',
                profile_image: '',
                gender: '',
                dob: ''
            });
            query.$promise.then(function(data) {
                sqliteService.createTable();
                $ionicLoading.hide();
                tostService.notify('Welcome "' + data.data.name + '"', 'top');
                timeStorage.set('userEmail', data.data.email, 1);
                timeStorage.set('userData', data, 1);
                timeStorage.set('guest', true, 1);
                $state.go('app.chats');
                $ionicHistory.nextViewOptions({
                    historyRoot: true,
                    disableBack: true
                });
                loginService.createEchoUserRoom();
            }, function(error) {
                tostService.notify('Error Occured . Try Again !!!', 'top');
            });
        };
        $ionicModal.fromTemplateUrl('startChatt.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.startChattModel = modal;
        });
        $scope.startChattCancel = function() {
            $scope.startChattModel.hide();
            $state.go('app.chats');
        };
        $scope.startChattWithFBFriends = function(friends) {
            $ionicLoading.show();
            var userData = timeStorage.get('userData');
            var query = contactsFactory.save({
                accessToken: userData.data.access_token,
                page: 0,
                limit: 100,
                currentTimestamp: _.now()
            });
            query.$promise.then(function(data) {
                for (var i = 0; i < friends.length; i++) {
                    for (var j = 0; j < data.data.length; j++) {
                        if (friends[i].checked && friends[i].id == data.data[j].social_id) {
                            console.log(data.data[j]);
                            socketService.create_room(data.data[j].id).then(function(data) {
                            });
                        }
                    }
                }
                $ionicLoading.hide();
                $scope.startChattModel.hide();
                $state.go('app.chats');
            });
        };
    }
})();