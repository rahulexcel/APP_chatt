(function() {
   'use strict';
   angular.module('chattapp')
       .factory('chatsFactory', chatsFactory);

   function chatsFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/rooms/list_my_rooms', {},{});
   };
})();