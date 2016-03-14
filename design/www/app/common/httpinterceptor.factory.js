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
                            console.log();
                            if(configURL.substring(0, 4) == 'http'){
                                config.url = config.url + '?access_token='+accessToken+'&currentTimestamp='+_.now()+'';
                            }
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