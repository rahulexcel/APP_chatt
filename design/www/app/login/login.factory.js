(function() {
   'use strict';
   angular.module('chattapp')
       .factory('loginFactory', loginFactory);

   function loginFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/users/register_login/:action_type/:action/:social_id/:platform/:device_id/:token/:email/:password', {},{});
   };
})();
