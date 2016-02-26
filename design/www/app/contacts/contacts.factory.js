(function() {
   'use strict';
   angular.module('starter')
       .factory('contactsFactory', contactsFactory);

   function contactsFactory($resource, Configurations) {
       // return $resource(Configurations.api_url+'/users/contacts', {},{});
       return $resource('app/mock/contacts.json', {},{});
   };
})();