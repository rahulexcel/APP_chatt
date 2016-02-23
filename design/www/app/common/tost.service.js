 (function() {
    'use strict';
    angular.module('starter')
            .factory('tostService', tostService);

    function tostService() {
        return {
            notify: function(message, position) {
                window.plugins.toast.showWithOptions(
                    {
                      message: message,
                      duration: "short",
                      position: position
                    }
                  );
            }
        }
    };

})();