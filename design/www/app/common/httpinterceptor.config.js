(function() {
    'use strict';
    angular.module('starter')
            .config(function($httpProvider) {
                $httpProvider.interceptors.push('myInterceptor');
            });
})();