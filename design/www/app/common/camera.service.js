(function() {
    'use strict';
    angular.module('chattapp')
            .factory('cameraService', cameraService);

    function cameraService($q, $ionicActionSheet, $ionicLoading, $rootScope) {
        var service = {};
        service.changePic = function() {
            var q = $q.defer();
            var hideSheet = $ionicActionSheet.show({
                buttons: [{
                        text: '<p class="text-center"><i class="ion-images"></i> Gallery</p>'
                    }, {
                        text: '<p class="text-center"><i class="ion-camera"></i> Camera</p>'
                    }],
                titleText: 'Image',
                cancelText: 'Cancel',
                cancel: function() {
                },
                buttonClicked: function(index) {
                    $ionicLoading.show({
                        template: 'Loading...'
                    });
                    service.getPicture(index).then(function(imageData) {

                        q.resolve(imageData);
                    }, function(err) {
                        q.reject(err);
                    });
                    return true;
                }
            });
            return q.promise;
        },
                service.getPicture = function(index) {
                    var q = $q.defer();
                    navigator.camera.getPicture(onSuccess, onFail, {
                        quality: 50,
                        destinationType: Camera.DestinationType.DATA_URL,
                        correctOrientation: true,
                        // allowEdit: true,
                        sourceType: index
                    });
                    function onSuccess(imageData) {
                        q.resolve(imageData);
                    }
                    function onFail(message) {
                        q.reject(message);
                    }
                    return q.promise;
                };
        return service;
    }
    ;

})();