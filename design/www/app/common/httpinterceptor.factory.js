(function() {
    'use strict';
    angular.module('starter')
            .factory('myInterceptor', function($localStorage) {
                var requestInterceptor = {
                    request: function(config) {
                        console.log(config);
                        var currentUser = $localStorage.userData;
                        if (currentUser) {
                            var accessToken = currentUser.data.access_token;
                            config.headers.Authorization =  accessToken;
                        }
                        if(config.method == 'POST'){
                            $localStorage.lastTimeStampFireApi = _.now();
                        }
                        return config;
                    }
                };
                return requestInterceptor;
            });
})();