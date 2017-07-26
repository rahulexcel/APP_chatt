(function() {
    'use strict';

    angular.module('chattapp')
            .controller('chatPageController', chatPageController);

    function chatPageController($ionicHistory, $scope, $localStorage, $rootScope, getRoomInfoFactory, timeStorage, $stateParams) {
        $scope.focusOut = function() {
            $rootScope.isFocused = 'focusOut';
        };
        $scope.height = screen.height;
        infoApi();
        $rootScope.background = '';
        function infoApi() {
            var userData = timeStorage.get('userData');
            var query = getRoomInfoFactory.save({
                accessToken: userData.data.access_token,
                room_id: $stateParams.roomId,
                currentTimestamp: _.now()
            });
            query.$promise.then(function(data) {
                // console.log(data);
                if(data.data.room.room_background){
                    $rootScope.background = data.data.room.room_background;
                    $rootScope.$broadcast('pageBackground', {data: data.data.room.room_background});

                } else{
                    $rootScope.background = '';
                    $rootScope.$broadcast('pageBackground', {data: ''});
                }
            });
        }
    }
})();