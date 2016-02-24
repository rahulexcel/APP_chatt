 (function() {
    'use strict';
    angular.module('starter')
            .factory('deviceService', deviceService);

    function deviceService() {
        return {
            getuuid: function() {
                if(window.plugins && window.plugins.device){
                    return device.uuid;
                }
            },
            platform: function() {
                if(window.plugins && window.plugins.device){
                    return device.platform;
                }
            }
        }
    };

})();