 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('loginService', loginService);

     function loginService($q, timeStorage, socketService, Configurations) {
         var service = {};
         var q = $q.defer();
         service.createEchoUserRoom = function() {
            socketService.create_room(Configurations.echoUserId).then(function(data) {
            });
         }
         return service;
     };

 })();