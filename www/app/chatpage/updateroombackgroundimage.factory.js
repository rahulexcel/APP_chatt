(function() {
   'use strict';
   angular.module('chattapp')
       .factory('updateRoomBackgroundImageFactory', updateRoomBackgroundImageFactory);

   function updateRoomBackgroundImageFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/rooms/update_room_background_image', {},{});
   };
})();