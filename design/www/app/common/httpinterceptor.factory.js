(function() {
    'use strict';
    angular.module('chattapp')
            .factory('myInterceptor', function($localStorage) {
                var requestInterceptor = {
                    request: function(config) {
                        var currentUser = $localStorage.userData;
                        if (currentUser) {
                            var accessToken = currentUser.data.access_token;
                            var configURL = config.url;
//
//                            console.log(configURL);
//                            console.log(configURL.substring(0, 38));
                            if (configURL.substring(0, 38) == 'http://144.76.34.244:3033/api/uploads/') {
                                
                                config.url = config.url + '?file_type=profile_image&accessToken=' + accessToken + '&currentTimestamp=' + _.now() + '';
                                config.headers['Content-Type'] = 'multipart/form-data;';
                            }
                            else if (configURL.substring(0, 10) == 'http://144') {
                                config.url = config.url + '?access_token=' + accessToken + '&currentTimestamp=' + _.now() + '';
                            }
                        }
                        if (config.method == 'POST') {
                            $localStorage.lastTimeStampFireApi = _.now();
                        }
                        return config;
                    }
                };
                return requestInterceptor;
            });
})();