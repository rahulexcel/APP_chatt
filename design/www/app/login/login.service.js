 (function() {
     'use strict';
     angular.module('chattapp')
         .factory('loginService', loginService);

     function loginService($q, $ionicPopup, socketService, Configurations) {
         var service = {};
         var q = $q.defer();
         service.createEchoUserRoom = function() {
            socketService.create_room(Configurations.echoUserId).then(function(data) {
            });
         };
         service.EULA= function () {
            var def=$q.defer();
            var myPopup = $ionicPopup.show({
                templateUrl: 'app/login/EULA.html',
                title: 'End User Licence Agreement',
                buttons: [
                    {text: 'Cancel'},
                    {
                        text: '<b>Accept</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            def.resolve(true);
                        }
                    }
                ]
            });
            return def.promise;
        }
         return service;
     };

 })();