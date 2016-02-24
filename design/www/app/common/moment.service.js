 (function() {
    'use strict';
    angular.module('starter')
            .factory('momentService', momentService);

    function momentService() {
        return {
            currentTimestamp: function() {
                return Math.floor(Date.now() / 1000);
            },
            currentDate: function() {
                return moment().format('YYYY-M-D');
            },
            currentDateTimeDay: function() {
                return moment().format('E YYYY-MMM-DD HH:mm:ss A');
            }
        }
    };

})();