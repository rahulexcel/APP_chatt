(function() {
   'use strict';
   angular.module('chattapp')
       .factory('publicChatFactory', publicChatFactory);

   function publicChatFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/rooms/create_room/:accessToken/:room_type/:chat_with/:room_name/:room_description/:currentTimestamp', {},{});
   };
})();