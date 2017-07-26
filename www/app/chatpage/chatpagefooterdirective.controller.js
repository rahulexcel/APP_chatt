(function() {
    'use strict';

    angular.module('chattapp')
            .controller('chatPageFooterDirectiveController', chatPageFooterDirectiveController);

    function chatPageFooterDirectiveController($rootScope, $scope, $ionicPlatform, $state, $timeout, $interval, $ionicScrollDelegate, chatPageFactory, $ionicLoading, $ionicHistory, timeStorage, socketService, $stateParams, sqliteService, chatpageService, $localStorage) {
        var self = this;
        var userData = timeStorage.get('userData');
        self.image = userData.data.profile_image;
        self.name = userData.data.name;
        self.user_id = userData.data.user_id;
        self.sendMessage = function() {
            if ($scope.messagetext == '') {
            } else {
                var currentTimeStamp = _.now();
                socketService.roomOpen($stateParams.roomId);
                sqliteService.saveMessageInDb($scope.messagetext, 'post', userData.data.user_id, userData.data.name, userData.data.profile_image, $stateParams.roomId, currentTimeStamp).then(function(lastInsertId) {
                    if (timeStorage.get('network')) {
                    } else {
                        socketService.room_message(lastInsertId, $stateParams.roomId, $scope.messagetext, currentTimeStamp);
                    }

                    var currentMessage = {
                        "id": lastInsertId,
                        "image": userData.data.profile_image,
                        "message": $scope.messagetext,
                        "messageTime": moment(currentTimeStamp).format("hh:mm a"),
                        "timeStamp": currentTimeStamp,
                        "name": userData.data.name,
                        "user_id": userData.data.user_id,
                        "message_status": 'post'
                    };
                    $rootScope.$broadcast('displayChatMessages', {data: currentMessage});
                    $ionicScrollDelegate.scrollBottom(false);
                    $scope.messagetext = '';
                }, 100);
                $ionicScrollDelegate.scrollBottom(false);
            }
        };
        var focus = 0;
        self.inputUp = function() {
          
            var inputChanged = 0;
            if ($rootScope.isFocused == 'focusOut' && focus == 0) {
                focus++;
             
                $rootScope.isFocused = false;

            } else {
                $rootScope.isFocused = 'foc';
                focus--;
            }

            var i = 0;
            $timeout(function() {
                $ionicScrollDelegate.scrollBottom(false);
                $scope.$apply();
            }, 300);
        };
        self.inputDown = function() {
            $ionicScrollDelegate.resize();
            $scope.$apply();
        };
        var message='';
        var debounce = _.debounce(fireSocketEvent, 0, false);
        function writingMessage() {
            if (message != $scope.messagetext) {
                message = $scope.messagetext;  
                debounce();
            }
        };
        function fireSocketEvent(){
            socketService.writingMessage($stateParams.roomId);
        }
        // document.addEventListener('focusIn', inputUp, false);
        // document.addEventListener('focusOut', inputDown, false);
        // document.addEventListener('change', writingMessage, false);
    }

})();