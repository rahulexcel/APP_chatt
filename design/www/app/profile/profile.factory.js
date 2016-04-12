(function() {
   'use strict';
   angular.module('chattapp')
       .factory('profileFactory', profileFactory);

   function profileFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/users/my_profile/:accessToken/:currentTimestamp/', {},{});
   };
})();
