(function() {
    'use strict';

    angular.module('chattapp')
            .controller('chatPageFooterDirectiveController', chatPageFooterDirectiveController);

    function chatPageFooterDirectiveController($rootScope, $state, $timeout, $interval, $ionicScrollDelegate, chatPageFactory, $ionicLoading, $ionicHistory, timeStorage, socketService, $stateParams, sqliteService, chatpageService) {
        var self = this;
        var userData = timeStorage.get('userData');
        self.image = userData.data.profile_image;
        self.name = userData.data.name;
        self.user_id = userData.data.user_id;
        self.sendMessage = function() {
            if (self.message == '') {
                console.log('empty');
            } else {
                var currentTimeStamp = _.now();
                sqliteService.saveMessageInDb(self.message, 'post', userData.data.user_id, userData.data.name, userData.data.profile_image, $stateParams.roomId, currentTimeStamp).then(function(lastInsertId) {
                    if (timeStorage.get('network')) {
                        console.log('do not fire from here');
                    } else {
                        socketService.room_message(lastInsertId, $stateParams.roomId, self.message, currentTimeStamp);
                    }
                    var currentMessage = {
                        "id": lastInsertId,
                        "image": userData.data.profile_image,
                        "message": self.message,
                        "messageTime": moment(currentTimeStamp).format("hh:mm a"),
                        "timeStamp": currentTimeStamp,
                        "name": userData.data.name,
                        "user_id": userData.data.user_id,
                        "message_status": 'post'
                    }
                    $rootScope.$broadcast('displayChatMessages', {data: currentMessage});
                    $ionicScrollDelegate.scrollBottom(false);
                    self.message = '';
                    $interval.cancel(interval);
                    $timeout.cancel(inputChangedPromise);
                })
                $ionicScrollDelegate.scrollBottom(false);
            }
        }
        self.inputUp = function() {
            inputChanged = 0;
            self.isFocused = true;
            i = 0;
            $timeout(function() {
                $ionicScrollDelegate.scrollBottom(false);
            }, 300);
        };
        self.inputDown = function() {
            $interval.cancel(interval);
            $ionicScrollDelegate.resize();
        };
        var inputChanged = 0;
        var i = 0;
        var interval;
        var inputChangedPromise;
        self.writingMessage = function() {
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
    }
})();