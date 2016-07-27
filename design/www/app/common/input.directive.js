angular.module('chattapp')
        .directive('inputFeild', function($timeout) {
            return {
                restrict: 'ACE',
                scope: {
                    'returnClose': '=',
                    'onReturn': '&',
                    'onFocus': '&',
                    'onClick': '&',
                    'onBlur': '&',
                    'trigger': '@isFocused',
                },
                link: function(scope, element, attr) {
                    element.bind('focus', function(e) {
                        if (scope.onFocus) {
                            $timeout(function() {
                                scope.onFocus();
                            });
                        }
                    });
                    element.bind('blur', function(e) {
                        if (scope.onBlur) {
                            $timeout(function() {
                                scope.onBlur();
                                // element[0].focus();
                            });
                        }
                    });
                    element.bind('keydown', function(e) {
                        if (e.which == 13) {
                            if (scope.returnClose)
                                element[0].blur();
                            if (scope.onReturn) {
                                $timeout(function() {
                                    scope.onReturn();
                                });
                            }
                        }
                    });
                    
                    var newVal;
                    scope.$watch('trigger', function(value) {
                        if (value === "focusOut" || value === false) {
                            newVal = '';
                        }
                        else if (value === "foc") {
                            newVal = "focus";
                            $timeout(function() {
                                element[0].focus();
                                element.on('blur', function() {
                                    if (!newVal) {
                                       
                                        element[0].blur();
                                        newVal = '';
                                    }
                                    else {
                                        
                                        element[0].focus();

                                    }
                                });
                            });
                        }

                    });
                }
            };
        });