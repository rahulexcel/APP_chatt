 (function() {
    'use strict';
    angular.module('chattapp')
            .factory('deviceService', deviceService);

    function deviceService() {
        return {
            getuuid: function() {
                if(window.plugins){
                    return device.uuid;
                } else{
                    return -1;
                }
            },
            platform: function() {
                if(window.plugins){
                    return device.platform;
                } else{
                    return 'desktop';
                }
            }
        }
    };

})();