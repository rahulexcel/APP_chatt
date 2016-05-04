var facebookLoginService = angular.module('facebookLoginService', []);

facebookLoginService.factory('facebookLogin', facebookLogin);
function facebookLogin($http, $q, $state) {
var service = {};
        service.fbLoginSuccess = function() {
            var def = $q.defer();
            facebookConnectPlugin.login(['email','user_friends', 'public_profile'], fbLoginSuccess, service.fbLoginError);
            function fbLoginSuccess(response){
            
                if (!response.authResponse) {
                    fbLoginError("Cannot find the authResponse");
                    return;
                }
                var authResponse = response.authResponse;
                service.getFacebookProfileInfo(authResponse)
                    .then(function(profileInfo) {
                        console.log(profileInfo);
                        profileInfo.accessToken = authResponse.accessToken;
                        def.resolve(profileInfo);
                    }, function(fail) {
                        console.log('profile info fail', fail);
                        def.reject(fail);
                    });
                }
                return def.promise;
            };
            service.fbLoginError = function(error) {
                console.log('fbLoginError', error);
            };
            service.getFacebookProfileInfo = function(authResponse) {
                var info = $q.defer();
                facebookConnectPlugin.api('/me?fields=email,name,gender&access_token=' + authResponse.accessToken, null,
                    function(response) {
                        console.log(response);
                        response.accessToken = authResponse.accessToken;
                        info.resolve(response);
                    },
                    function(response) {
                        console.log(response);
                        info.reject(response);
                    }
                );
                return info.promise;
            };
             service.login = function() {
                var def = $q.defer();
            facebookConnectPlugin.getLoginStatus(function(success) {
                if (success.status === 'connected') {
                    console.log('getLoginStatus', success.status);
                        service.getFacebookProfileInfo(success.authResponse)
                            .then(function(profileInfo) {
                                console.log(profileInfo);
                                def.resolve(profileInfo);
                            }, function(fail) {
                                console.log('profile info fail', fail);
                                def.reject(fail);
                            });
                } else {
                    console.log('getLoginStatus', success.status);
                    def.resolve(success.status);
                }
            });
            return def.promise;
        }
        return service;
    }