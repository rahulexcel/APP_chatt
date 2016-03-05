 (function() {
     'use strict';
     angular.module('starter')
         .factory('lastUsesTimeService', lastUsesTimeService);

     function lastUsesTimeService(lastUsesTimeFactory, timeStorage, $interval, $localStorage) {
         return {
             updateTime: function() {
                     var userData = timeStorage.get('userData');
                     if (userData) {
                         if (!_.isEmpty(userData.data.access_token)) {
                             this.fireApi(userData.data.access_token);
                         }
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
             fireApi: function(access_token) {
                 var currentTimestamp = _.now();
                 var query = lastUsesTimeFactory.query({
                     currentTimestamp: currentTimestamp,
                     access_token: access_token
                 });
                 query.$promise.then(function(data) {
                     console.log(data);
                 });
             }
         }
     };
 })();