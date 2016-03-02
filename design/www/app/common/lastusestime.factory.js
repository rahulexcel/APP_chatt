(function() {
   'use strict';
   angular.module('starter')
       .factory('lastUsesTimeFactory', lastUsesTimeFactory);

   function lastUsesTimeFactory($resource, Configurations) {
       // return $resource(Configurations.api_url+'/users/contacts', {},{});
       return $resource('app/mock/contacts.json', {},{});
   };
})();