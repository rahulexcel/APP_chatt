 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('contactsService', contactsService);

     function contactsService(timeStorage, $rootScope, contactsFactory, timeZoneService) {
         var service = {};
         var userData =  timeStorage.get('userData');
         service.listUsers = function() {
            var query = contactsFactory.save({
                 page: 0,
                 limit:100,
                 currentTimestamp: _.now()
             });
             query.$promise.then(function(data) {
                 var newData = [];
                 for(var i = 0; i < data.data.length; i++){
                    data.data[i].lastSeen = moment.unix(data.data[i].lastSeen).tz(timeZoneService.getTimeZone()).format("hh:mm a");
                    newData.push(data.data[i]); 
                 }
                 timeStorage.set('listUsers', newData, 1);
                 $rootScope.$broadcast('updatedlistUsers', { data: newData });
             });
         }
         return service;
     };

 })();