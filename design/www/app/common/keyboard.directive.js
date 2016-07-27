angular.module('chattapp').directive('isFocused', function($timeout) {
    
    return {
        scope: {trigger: '=isFocused'},
        link: function(scope, element) {
            console.log('keyboard directive');
            scope.$watch('trigger', function(value) {
                if (value === "true") {
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