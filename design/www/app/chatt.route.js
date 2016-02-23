(function() {
    'use strict';

angular.module('starter', ['ionic', 'ngStorage', 'ngResource', 'GoogleLoginService', 'facebookLoginService', 'ngMessages'])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('login', {
    url: '/login',
    cache:false,
    templateUrl: 'app/login/login.html',
    controller: 'loginController'
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});

})();