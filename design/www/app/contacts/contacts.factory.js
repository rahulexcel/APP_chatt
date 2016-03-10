(function() {
   'use strict';
   angular.module('starter')
       .factory('contactsFactory', contactsFactory);

   function contactsFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/users/list_users', {},{});
   };
})();