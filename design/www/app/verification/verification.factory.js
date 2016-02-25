(function() {
   'use strict';
   angular.module('starter')
       .factory('verificationFactory', verificationFactory);

   function verificationFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/users/do_user_verification/:email/:code', {},{});
   };
})();
