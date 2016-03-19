 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('contactsService', contactsService);

     function contactsService(timeStorage, $rootScope, contactsFactory) {
         var service = {};
         var userData =  timeStorage.get('userData');
         service.listUsers = function() {
            var query = contactsFactory.save({
                 page: 0,
                 limit:100,
                 currentTimestamp: _.now()
             });
             query.$promise.then(function(data) {
                 timeStorage.set('listUsers', data.data, 1);
                 $rootScope.$broadcast('updatedlistUsers', { data: data.data });
             });
         }
         return service;
     };

 })();