 (function() {
    'use strict';
    angular.module('starter')
            .factory('tostService', tostService);

    function tostService() {
        return {
            notify: function(message, position) {
              if(window.plugins && window.plugins.toast){
                ///then execute ur code
                window.plugins.toast.showWithOptions(
                    {
                      message: message,
                      duration: "short",
                      position: position
                    }
                  );
                }else{
                // this means on browser simply alert the message
                alert(message);
                }
            }
        }
    };

})();