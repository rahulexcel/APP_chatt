(function() {
   'use strict';
   angular.module('starter')
       .factory('registerFactory', registerFactory);

   function registerFactory($resource, Configurations) {
       return $resource(Configurations.Hostserver+'/register_login/:action_type/:action/:social_id/:platform/:token/:email/:name/:password', {},{});
   };
})();