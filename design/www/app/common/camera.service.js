 (function() {
     'use strict';
     angular.module('starter')
         .factory('cameraService', cameraService);

     function cameraService($q, $ionicActionSheet) {
         var service = {};
         service.changePic = function() {
                 var q = $q.defer();
                 var hideSheet = $ionicActionSheet.show({
                     buttons: [{
                         text: '<i class="ion-images"></i> Gallery'
                     }, {
                         text: '<i class="ion-camera"></i> Camera'
                     }],
                     titleText: 'Profile photo',
                     cancelText: 'Cancel',
                     cancel: function() {},
                     buttonClicked: function(index) {
                         console.log(index);
                         service.getPicture(index).then(function(imageData) {
                             q.resolve(imageData);
                         }, function(err) {
                             q.reject(err);
                         })
                         return true;
                     }
                 });
                 return q.promise;
             },
             service.getPicture = function(index) {
                 var q = $q.defer();
                 navigator.camera.getPicture(onSuccess, onFail, {
                     quality: 100,
                     destinationType: Camera.DestinationType.DATA_URL,
                     correctOrientation: true,
                     // allowEdit: true,
                     sourceType: index,
                     targetWidth: 128,
                     targetHeight: 128
                 });
                 function onSuccess(imageData) {
                     q.resolve(imageData);
                 }
                 function onFail(message) {
                     q.reject(message);
                 }
                 return q.promise;
             }
         return service;
     };

 })();