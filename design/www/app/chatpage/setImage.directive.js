(function() {
    'use strict';

    angular.module('chattapp')

            .directive('setImage', function() {
                var directive = {};
                directive.scope = {InnerHeight: "=im"};
                directive.link = function(scope, iElement, iAttrs) {
                    iElement.on('load', function() {
                        var h = iElement[0].height;
                        var w = iElement[0].width;
                        var hratio = h / scope.InnerHeight;
                        var nwidth = w / hratio;
                        iElement.css({'width': nwidth + 'pt', 'height': '110pt'});

                    });
                };

                return directive;
            });
})();