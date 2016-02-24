 (function() {
    'use strict';
    angular.module('starter')
            .factory('deviceService', deviceService);

    function deviceService() {
        return {
            getuuid: function() {
                if(window.plugins){
                    return device.uuid;
                }
            },
            platform: function() {
                if(window.plugins){
                    return device.platform;
                }
            }
        }
    };

})();