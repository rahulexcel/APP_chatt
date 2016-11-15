(function() {
   'use strict';
   angular.module('chattapp')
       .factory('flagUserFactory', flagUserFactory);

   function flagUserFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/users/flag_user/:flagByUserId/:flagWhomUserId', {},{});
   };
})();