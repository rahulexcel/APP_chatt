(function() {
   'use strict';
   angular.module('chattapp')
       .factory('getUserProfileFactory', getUserProfileFactory);

   function getUserProfileFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/users/get_user_profile/:accessToken/:user_id/:currentTimestamp', {},{});
   };
})();