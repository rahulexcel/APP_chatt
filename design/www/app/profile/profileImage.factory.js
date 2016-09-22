(function() {
    'use strict';
    angular.module('chattapp')
            .factory('profileImageFactory', profileImageFactory);

    function profileImageFactory($resource, Configurations, Upload, $q, tostService) {
        var image = {};
        image.upload = function(data) {
            var def = $q.defer();
            Upload.upload({
                url: Configurations.api_url + '/uploads/upload',
                data: data
            }).then(function(resp) {
                tostService.notify('Successfully Uploaded', 'top');
                def.resolve(resp);
            }, function(resp) {
                tostService.notify('Uploading Failed', 'top');
                def.reject(resp);
            }, function(evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                tostService.notify('Uploading: ' + progressPercentage + '% ', 'top');
                console.log('Uploaded: ' + progressPercentage + '% '); //progress of loading image
            });
            return def.promise;
        };
        return image;
    };
})();
