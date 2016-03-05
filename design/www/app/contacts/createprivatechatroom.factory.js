(function() {
   'use strict';
   angular.module('starter')
       .factory('createPrivateChatroomFactory', createPrivateChatroomFactory);

   function createPrivateChatroomFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/rooms/create_private_room?', {
       	access_token:'@access_token'
       },{});
   };
})();
