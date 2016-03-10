(function() {
    'use strict';
    angular.module('chattapp')
            .config(function($httpProvider) {
                $httpProvider.interceptors.push('myInterceptor');
            });
})();