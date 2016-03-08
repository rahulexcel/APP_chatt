(function() {
   'use strict';
   angular.module('starter')
       .factory('chatsFactory', chatsFactory);

   function chatsFactory($resource, Configurations) {
       // return $resource(Configurations.api_url+'/users/contacts', {},{});
       return $resource('app/mock/chats.json', {},{});
   };
})();