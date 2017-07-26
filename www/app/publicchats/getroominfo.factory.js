(function() {
   'use strict';
   angular.module('chattapp')
       .factory('getRoomInfoFactory', getRoomInfoFactory);

   function getRoomInfoFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/rooms/get_room_info/:accessToken/:room_id/:currentTimestamp', {},{});
   };
})();