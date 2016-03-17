(function() {
   'use strict';
   angular.module('chattapp')
       .factory('chatPageFactory', chatPageFactory);

   function chatPageFactory($resource, Configurations) {
       return $resource(Configurations.api_url+'/rooms/list_room_messages/:accessToken/:room_id/:page/:limit/:currentTimestamp', {},{});
   };
})();