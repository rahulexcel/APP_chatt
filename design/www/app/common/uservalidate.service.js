(function() {
    'use strict';
    angular.module('chattapp')
        .factory('userValidate', userValidate);

    function userValidate($state, $stateParams, $rootScope, $location, $localStorage) {
        return {
            validUser: function() {
                $rootScope.$on('$stateChangeStart',
                    function(event, toState, toParams, fromState, fromParams) {
                        if ($localStorage.userData) {
                            if (toState.name == 'app.chatpage' || toState.name == 'app.setting' || toState.name == 'app.profile' || toState.name == 'app.chats' || toState.name == 'app.publicChats' 
                                || toState.name == 'app.addInGroup' || toState.name == 'app.inviteInGroup' || toState.name == 'app.contacts') {

                            } else {
                                $state.transitionTo("app.chats");
                                event.preventDefault();
                            }
                        } else {
                            if (toState.name == 'login') {

                            } else {
                                $state.transitionTo("login");
                                event.preventDefault();
                            }
                        }
                    })
            }
        }
    }
})();   