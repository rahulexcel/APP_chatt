(function() {
    'use strict';

    angular.module('chattapp')

            .directive('chatsFooter', function(timeStorage, tostService, $state,$ionicViewSwitcher) {
                var directive = {};
                directive.restrict = 'E';
                directive.templateUrl = "app/chats/templates/footer.html";
                directive.scope = {
                    chatsFooter: "=footer"
                },
                directive.compile = function(element, attributes) {

                    var linkFunction = function($scope, element, attributes) {
                        $scope.search = function(state) {
                           
                            if (timeStorage.get('network')) {
                              window.plugins.toast.showShortTop('You need to online to access this'); 
                               
                            }
                            else
                            {
                                $ionicViewSwitcher.nextDirection('forward');
                                $state.go(state);
                            }
                        };
                    };
                    return linkFunction;
                };
                return directive;
            });
})();