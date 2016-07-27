 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('timeZoneService', timeZoneService);

     function timeZoneService() {
         var service = {};
         service.getTimeZone = function() {
                 return jstz.determine().name();
             }
         return service;
     };

 })();