(function() {
    'use strict';

    angular.module('starter', ['ionic', 'ngStorage', 'ngResource', 'GoogleLoginService', 'facebookLoginService', 'ngMessages'])

    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('login', {
                url: '/login',
                cache: false,
                templateUrl: 'app/login/login.html',
                controller: 'loginController',
                controllerAs: 'login'
            })
            .state('register', {
                url: '/register',
                cache: false,
                templateUrl: 'app/register/register.html',
                controller: 'registerController',
                controllerAs: 'register'
            })
            .state('verification', {
                url: '/verification',
                cache: false,
                templateUrl: 'app/verification/verification.html',
                controller: 'verificationController',
                controllerAs: 'verification'
            })
            .state('forgotPassword', {
                url: '/forgotPassword',
                cache: false,
                templateUrl: 'app/forgotpassword/forgotpassword.html',
                controller: 'forgotPasswordController',
                controllerAs: 'forgotPassword'
            })
            .state('app', {
                url: '/app',
                cache:false,
                abstract: true,
                templateUrl: 'app/menu/menu.html',
                controller: 'menuController',
                controllerAs: 'menu'
              })
            .state('app.contacts', {
                url: '/contacts',
                cache:false,
                views: {
                  'menuContent': {
                    templateUrl: 'app/contacts/contacts.html',
                    controller: 'contactsController',
                    controllerAs: 'contacts'
                  }
                }
              })
            .state('app.resetpassword', {
                url: '/resetpassword',
                cache:false,
                views: {
                  'menuContent': {
                    templateUrl: 'app/resetpassword/resetpassword.html',
                    controller: 'resetPasswordController',
                    controllerAs: 'resetpassword'
                  }
                }
              });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
    });

})();