 (function() {
     'use strict';
     angular.module('starter')
         .factory('lastUsesTimeService', lastUsesTimeService);

     function lastUsesTimeService(lastUsesTimeFactory, timeStorage, $interval, $localStorage) {
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
             updateTimeWithHttp: function() {
                 delete $localStorage.lastTimeStampFireApi;
                 $interval(function() {
                     var LastTimeFireApi = $localStorage.lastTimeStampFireApi;
                     if (LastTimeFireApi) {
                         var currentTimestamp = _.now();
                         var diffrence = currentTimestamp - LastTimeFireApi;
                         if (diffrence > 300000) {
                             this.updateTime();
                         }
                     }
                 }, 60000);
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