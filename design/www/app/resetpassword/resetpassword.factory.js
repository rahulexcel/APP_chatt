(function() {
   'use strict';
   angular.module('chattapp')
       .factory('resetPasswordFactory', resetPasswordFactory);

   function resetPasswordFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/users/reset_password?', {
       	access_token:'@access_token'
       },{});
   };
})();
