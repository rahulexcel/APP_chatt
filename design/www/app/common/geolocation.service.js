(function() {
   'use strict';
   angular.module('chattapp')
           .factory('geoLocation', geoLocation);

   function geoLocation($cordovaGeolocation,$interval,timeStorage, $localStorage) {
       return {
           update: function() {
               $interval(function() {
                   var posOptions = {timeout: 10000, enableHighAccuracy: false};
                   $cordovaGeolocation
                   .getCurrentPosition(posOptions)
                   .then(function (position) {
                    var lat=position.coords.latitude;
                    var lang=position.coords.longitude;
                    $localStorage.lat=lat;
                    $localStorage.lng=lang;
                   }, function(err) {
                    console.log(err);
                   //error process
                   });
                   }, 1000);
           }
       }
   };

})();