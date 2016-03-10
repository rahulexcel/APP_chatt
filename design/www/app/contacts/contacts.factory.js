(function() {
   'use strict';
   angular.module('chattapp')
       .factory('contactsFactory', contactsFactory);

   function contactsFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/users/list_users', {},{});
   };
})();