(function() {
    'use strict';

    angular.module('chattapp')
            .service('Onsuccess', stateChange);

    function stateChange($rootScope, timeStorage) {
        this.footerTab = function(callback) {
       
            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
             console.log(toState.name);
                if (toState.name == 'app.chats') {
                    if (callback) {
                        callback(true, false, false, false);
                    }
                    
                } else if (toState.name == 'app.setting') {
                    if (callback) {
                        callback(false, false, true, false);
                    }
                  
                }
                else if (toState.name == "app.contacts") {
                    if (callback) {
                        callback(false, true, false, false);
                    }

                }
                else if (toState.name == "app.publicChats") {
                    if (callback) {
                        callback(false, false, false, true);
                    }
                   
                }

            });
        }
    }

})();