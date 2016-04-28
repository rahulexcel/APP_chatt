(function() {
    'use strict';

    angular.module('chattapp')
            .controller('chatPageFooterDirectiveController', chatPageFooterDirectiveController);

    function chatPageFooterDirectiveController($rootScope, $scope, $ionicPlatform, $state, $timeout, $interval, $ionicScrollDelegate, chatPageFactory, $ionicLoading, $ionicHistory, timeStorage, socketService, $stateParams, sqliteService, chatpageService) {
        var self = this;
        var userData = timeStorage.get('userData');
        self.image = userData.data.profile_image;
        self.name = userData.data.name;
        self.user_id = userData.data.user_id;
        $scope.emojiMessage={};
        self.sendMessage = function() {
            if ($scope.emojiMessage.rawhtml == '') {
            } else {
                var currentTimeStamp = _.now();
                socketService.roomOpen($stateParams.roomId);
                sqliteService.saveMessageInDb($scope.emojiMessage.rawhtml, 'post', userData.data.user_id, userData.data.name, userData.data.profile_image, $stateParams.roomId, currentTimeStamp).then(function(lastInsertId) {
                    if (timeStorage.get('network')) {
                    } else {
                        socketService.room_message(lastInsertId, $stateParams.roomId, $scope.emojiMessage.rawhtml, currentTimeStamp);
                    }

                    var currentMessage = {
                        "id": lastInsertId,
                        "image": userData.data.profile_image,
                        "message": $scope.emojiMessage.rawhtml,
                        "messageTime": moment(currentTimeStamp).format("hh:mm a"),
                        "timeStamp": currentTimeStamp,
                        "name": userData.data.name,
                        "user_id": userData.data.user_id,
                        "message_status": 'post'
                    };
                    $rootScope.$broadcast('displayChatMessages', {data: currentMessage});
                    $ionicScrollDelegate.scrollBottom(false);
                    $scope.emojiMessage = {};
                    $interval.cancel(interval);
                    $timeout.cancel(inputChangedPromise);
                }, 100);
                $ionicScrollDelegate.scrollBottom(false);
            }
        };

        var focus = 0;
        function inputUp() {
            inputChanged = 0;
            if ($scope.isFocused == 'focusOut' && focus == 0) {
                focus++;
                console.log('sdfsdfsdfsdfsd');
                $scope.isFocused = false;

            } else {
                $scope.isFocused = 'foc';
                focus--;
            }

            i = 0;
            $timeout(function() {
                $ionicScrollDelegate.scrollBottom(false);
            }, 300);
        };
        function inputDown() {
            console.log('Input Down');
            $interval.cancel(interval);
            $ionicScrollDelegate.resize();
        };
        var inputChanged = 0;
        var i = 0;
        var interval;
        var inputChangedPromise;
        function writingMessage() {
            if (inputChanged == 0) {
                socketService.writingMessage($stateParams.roomId);
                inputChanged = 1;
            }
            if (inputChangedPromise) {
                $timeout.cancel(inputChangedPromise);
            }
            inputChangedPromise = $timeout(function() {
                socketService.writingMessage($stateParams.roomId);
                $interval.cancel(interval);
                i = 0;
                inputChanged = 1;
            }, 1000);
            if (i == 0) {
                interval = $interval(function() {
                    socketService.writingMessage($stateParams.roomId);
                }, 4000);
                i = 1;
            }
        };
        document.addEventListener('focusIn', inputUp, false);
        document.addEventListener('focusOut', inputDown, false);
        document.addEventListener('change', writingMessage, false);
    }
})();