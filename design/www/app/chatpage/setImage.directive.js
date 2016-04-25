(function() {
    'use strict';

    angular.module('chattapp')

            .directive('setImage', function() {
                console.log('hello');
                var directive = {};

                directive.scope = {InnerHeight: "=im"};
                directive.link = function(scope, iElement, iAttrs) {

                    console.log('sdfsdfsdfsdfsdfsdfsd');
                    iElement.on('load', function() {

                        var h = iElement[0].height;
                        var w = iElement[0].width;
                        console.log(h, w);
                        console.log(scope.InnerHeight);
                        var hratio = h / scope.InnerHeight;
                        var nwidth = w / hratio;
                        console.log(nwidth);

                        iElement.css({'width': nwidth + 'pt', 'height': '110pt'});

                    });
                };

                return directive;
            });
})();