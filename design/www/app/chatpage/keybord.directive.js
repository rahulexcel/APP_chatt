(function() {
    'use strict';
    angular.module('chattapp').directive('isfocused', function($timeout) {
      return {
        scope: { trigger: '@isFocused' },
        link: function(scope, element) {
              console.log('hello thsisdasd asdasdasd asdasd');
          scope.$watch('trigger', function(value) {
            
            if(value === "true") {
              $timeout(function() {
                element[0].focus();

                element.on('blur', function() {
                  element[0].focus();
                });
              });
            }

          });
        }
      };
    });
})();