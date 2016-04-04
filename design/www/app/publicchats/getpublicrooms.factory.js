(function() {
   'use strict';
   angular.module('chattapp')
       .factory('getPublicRoomsFactory', getPublicRoomsFactory);

   function getPublicRoomsFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/rooms/get_public_rooms/:accessToken/:page/:limit/:currentTimestamp', {},{});
   };
})();