(function() {
   'use strict';
   angular.module('starter')
       .factory('chatPageFactory', chatPageFactory);

   function chatPageFactory($resource, Configurations) {
       // return $resource(Configurations.api_url+'/users/:user_Id/chats', {},{});
       return $resource('app/mock/chatpage.json', {},{});
   };
})();