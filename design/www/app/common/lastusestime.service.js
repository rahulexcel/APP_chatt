 (function() {
     'use strict';
     angular.module('starter')
         .factory('lastUsesTimeService', lastUsesTimeService);

     function lastUsesTimeService(lastUsesTimeFactory, timeStorage) {
         return {
             updateTime: function(userId) {
                 if (_.isEmpty(userId)) {
                     var userData = timeStorage.get('userData');
                     if (userData) {
                         if (!_.isEmpty(userData.data.user_id)) {
                             this.fireApi(userData.data.user_id);
                         }
                     }
                 } else {
                     this.fireApi(userId);
                 }
             },
             fireApi: function(userId) {
                 var currentTimestamp = _.now();
                 var query = lastUsesTimeFactory.query({
                     currentTimestamp: currentTimestamp,
                     userId: userId
                 });
                 query.$promise.then(function(data) {
                     console.log(data);
                 });
             }
         }
     };
 })();