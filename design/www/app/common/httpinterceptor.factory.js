(function() {
    'use strict';
    angular.module('starter')
            .factory('myInterceptor', function($localStorage) {
                var requestInterceptor = {
                    request: function(config) {
                        // console.log(config);
                        if(config.method == 'POST'){
                            $localStorage.lastTimeStampFireApi = _.now();
                        }
                        return config;
                    }
                };
                return requestInterceptor;
            });
})();