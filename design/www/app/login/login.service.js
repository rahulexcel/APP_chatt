 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('loginService', loginService);

     function loginService($q, timeStorage, socketService) {
         var service = {};
         var q = $q.defer();
         service.createEchoUserRoom = function() {
            socketService.create_room('57f1fc141126f479422b5c77').then(function(data) {
            });
         }
         return service;
     };

 })();