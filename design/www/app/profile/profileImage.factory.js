(function() {
    'use strict';
    angular.module('chattapp')
            .factory('profileImageFactory', profileImageFactory);

    function profileImageFactory($resource, Configurations,Upload,$q) {

        var image = {};
        image.upload = function(data) {
            var def = $q.defer();
            Upload.upload({
                url: Configurations.api_url + '/uploads/upload',
                data: data
            }).then(function(resp) {
                def.resolve(resp);

            }, function(resp) {
                def.reject(resp);
            }, function(evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% '); //progress of loading image
            });
            return def.promise;
        }
        return image;
    }
    ;
})();
