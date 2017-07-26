(function() {
    'use strict';

    angular.module('chattapp', ['ionic', 'ngStorage', 'ngFileUpload', 'ngImgCrop', 'ngResource', 'GoogleLoginService', 'facebookLoginService', 'ngMessages', 'ngSanitize', 'ngCordova', 'uiGmapgoogle-maps'])
            .config(function($stateProvider, $urlRouterProvider) {
                $stateProvider

                        .state('login', {
                            url: '/login',
                            cache: false,
                            templateUrl: 'app/login/login.html',
                            controller: 'loginController',
                            controllerAs: 'login'
                        })
                        .state('app', {
                            url: '/app',
                            cache: false,
                            abstract: true,
                            templateUrl: 'app/menu/menu.html',
                            controller: 'menuController',
                            controllerAs: 'menu'
                        })
                        .state('app.contacts', {
                            url: '/contacts',
                            cache: false,
                            views: {
                                'menuContent': {
                                    templateUrl: 'app/contacts/contacts.html',
                                    controller: 'contactsController',
                                    controllerAs: 'contacts'
                                }
                            }
                        })
                        .state('app.chatpage', {
                            url: '/chatpage/:roomId',
                            cache: false,
                            views: {
                                'menuContent': {
                                    templateUrl: 'app/chatpage/chatpage.html',
                                    controller: 'chatPageController',
                                    controllerAs: 'chatPage'
                                }
                            }
                        })
                        .state('app.setting', {
                            url: '/setting',
                            cache: false,
                            views: {
                                'menuContent': {
                                    templateUrl: 'app/setting/setting.html',
                                    controller: 'settingController',
                                    controllerAs: 'setting'
                                }
                            }
                        })
                        .state('app.profile', {
                            url: '/profile',
                            cache: false,
                            views: {
                                'menuContent': {
                                    templateUrl: 'app/profile/profile.html',
                                    controller: 'profileController',
                                    controllerAs: 'profile'
                                }
                            }
                        })
                        .state('app.chats', {
                            url: '/chats',
                            cache: false,
                            views: {
                                'menuContent': {
                                    templateUrl: 'app/chats/chats.html',
                                    controller: 'chatsController',
                                    controllerAs: 'chats'
                                }
                            }
                        })
                        .state('app.publicChats', {
                            url: '/publicChats',
                            cache: false,
                            views: {
                                'menuContent': {
                                    templateUrl: 'app/publicchats/publicchats.html',
                                    controller: 'publicChatsController',
                                    controllerAs: 'publicChats'
                                }
                            }
                        })
                        .state('app.addInGroup', {
                            url: '/addInGroup',
                            cache: false,
                            views: {
                                'menuContent': {
                                    templateUrl: 'app/addingroup/addingroup.html',
                                    controller: 'addInGroupController',
                                    controllerAs: 'addInGroup'
                                }
                            }
                        })
                        .state('app.inviteInGroup', {
                            url: '/inviteInGroup',
                            cache: false,
                            views: {
                                'menuContent': {
                                    templateUrl: 'app/inviteingroup/inviteingroup.html',
                                    controller: 'inviteInGroupController',
                                    controllerAs: 'inviteInGroup'
                                }
                            }
                        });
                // if none of the above states are matched, use this as the fallback
                // $urlRouterProvider.otherwise('/login');
                 $urlRouterProvider.otherwise(function($injector, $location) {
            var $state = $injector.get("$state");
            $state.go('login');
        });
                 
            });
})();