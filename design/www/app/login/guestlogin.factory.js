(function() {
   'use strict';
   angular.module('chattapp')
       .factory('guestloginFactory', guestloginFactory);

   function guestloginFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/users/guest_login/:action_type/:action/:social_id/:platform/:device_id/:token/:email/:password', {},{});
   };
})();
