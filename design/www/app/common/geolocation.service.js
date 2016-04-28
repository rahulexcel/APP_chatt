(function() {
   'use strict';
   angular.module('chattapp')
           .factory('geoLocation', geoLocation);

   function geoLocation($cordovaGeolocation,$interval,timeStorage) {
       return {
           update: function() {
               $interval(function() {
                   var posOptions = {timeout: 10000, enableHighAccuracy: false};
                   $cordovaGeolocation
                   .getCurrentPosition(posOptions)
                   .then(function (position) {
                   console.log(position);
                   // timeStorage.set('geoLocation',position,1);
                   }, function(err) {
                   //error process
                   });
                   }, 4000);
           }
       }
   };

})();