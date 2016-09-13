(function() {
    'use strict';
    angular.module('chattapp').directive('isfocused', function($timeout) {
      return {
        scope: { trigger: '@isFocused' },
        link: function(scope, element) {
          scope.$watch('trigger', function(value) {
            console.log('hi')
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