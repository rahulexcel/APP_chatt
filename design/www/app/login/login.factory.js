(function() {
   'use strict';
   angular.module('starter')
       .factory('loginFactory', loginFactory);

   function loginFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/register_login/:action_type/:action/:social_id/:platform/:device_id/:token/:email/:password', {},{});
   };
})();
