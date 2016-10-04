(function() {
    'use strict';

    angular.module('chattapp')
            .controller('chatPageCenterDirectiveController', chatPageCenterDirectiveController);


    function chatPageCenterDirectiveController($scope, $state, $localStorage, $timeout, $ionicScrollDelegate, chatPageFactory, $ionicLoading, $ionicHistory, timeStorage, socketService, $stateParams, $ionicModal, sqliteService, chatpageService, timeZoneService, geoLocation, $cordovaFileTransfer, tostService) {
        var self = this;
        var chatWithUserData = timeStorage.get('chatWithUserData');
        self.isPublicRoom = true;
        if (chatWithUserData.id) {
            self.isPublicRoom = false;
        }
        $scope.imgDpuser=timeStorage.get('chatWithUserData').pic;
        self.height = screen.height;
        if ($localStorage['bgImage']) {
            self.background = $localStorage['bgImage'];
        }
        var userData = timeStorage.get('userData');
        self.user_id = userData.data.user_id;
        self.user_name = userData.data.name;

        $scope.$on('newRoomMessage', function(event, response) {
            if (response.data.room_id == $stateParams.roomId) {
                socketService.update_message_status_room_open(response.data.message_id, $stateParams.roomId);
                if( response.data.message_body.substr(0, 8) == '<img cla'){
                    response.data.message_body = response.data.message_body.replace('.png','_small.png');
                    response.data.message_body = response.data.message_body.replace('.jpg','_small.jpg');
                }
                self.displayChatMessages.push({
                    "image": response.data.profile_image,
                    "message": response.data.message_body,
                    "messageTime": moment.unix(response.data.message_time).tz(timeZoneService.getTimeZone()).format("hh:mm a"),
                    "name": response.data.name,
                    "timeStamp": response.data.message_time,
                    "message_type": response.data.message_type,
                });
                self.tempMessage = [];
                //for echo user
                var chatWithUserData = timeStorage.get('chatWithUserData');
                if(chatWithUserData.name == "echo" && chatWithUserData.id == "57f1fc141126f479422b5c77"){
                    for (var i = 0; i < self.displayChatMessages.length; i++) {
                        self.displayChatMessages[i].message_status = 'seen';
                        $scope.$evalAsync();
                    }
                }
                $scope.$evalAsync();
                $ionicScrollDelegate.scrollBottom(false);
            }
        });
        $scope.$on('sentMessagesIds', function(event, response) {
            for (var i = 0; i < self.displayChatMessages.length; i++) {
                if (self.displayChatMessages[i].id == response.data.msg_local_id) {
                    self.displayChatMessages[i].message_status = 'sent';
                    self.displayChatMessages[i].id = response.data.message_id;
                    self.displayChatMessages[i].messageTime = moment.unix(response.data.message_time).tz(timeZoneService.getTimeZone()).format("hh:mm a");
                    self.displayChatMessages[i].timeStamp = response.data.message_time;
                    $scope.$evalAsync();
                }
                //only for local Image 
                if (self.displayChatMessages[i].id == 785412) {
                    self.displayChatMessages[i].message_status = 'sent';
                    self.displayChatMessages[i].id = 214587;
                    $scope.$evalAsync();
                }
            }
            $scope.$evalAsync();
        });
        $scope.$on('response_update_message_status_response', function(event, response) {
            for (var i = 0; i < self.displayChatMessages.length; i++) {
                for (var j = 0; j < response.data.length; j++) {
                    if (self.displayChatMessages[i].id == response.data[j]) {
                        self.displayChatMessages[i].message_status = 'seen';
                        $scope.$evalAsync();
                    }
                    //only for local Image 
                    if (self.displayChatMessages[i].id == 214587) {
                        self.displayChatMessages[i].message_status = 'seen';
                        $scope.$evalAsync();
                    }
                }
            }
            $scope.$evalAsync();
        });
        $scope.$on('displayChatMessages', function(event, response) {
            self.displayChatMessages.push(response.data);
            $scope.$evalAsync();
            $ionicLoading.hide();
        });
        self.tempMessage = [];
        var flag = 0;
        var increseTimeout = 0;
        var inputChangedPromise;
        $scope.$on('room_user_typing_message', function(event, response) {
            if ($stateParams.roomId == response.data.room_id) {
                if (inputChangedPromise) {
                    $timeout.cancel(inputChangedPromise);
                }
                if (flag == 0) {
                    self.tempMessage.unshift(response.data.name);
                    flag = 1;
                }
                if (self.tempMessage[0] != response.data.name) {
                    self.tempMessage.unshift(response.data.name);
                }
                $timeout(function() {
                    $ionicScrollDelegate.scrollBottom(false);
                });
                $scope.$evalAsync();
                inputChangedPromise = $timeout(function() {
                    self.tempMessage = [];
                }, 2000);
            }
        });
        $scope.$on('now_device_is_online', function(event, response) {
            socket.emit('APP_SOCKET_EMIT', 'room_open', {
                accessToken: userData.data.access_token,
                room_id: $stateParams.roomId,
                currentTimestamp: _.now()
            });
            $timeout(function() {
                roomOpenApi();
            }, 3000);
        });
        sqliteService.getMessageDataFromDB($stateParams.roomId).then(function(response) {
            for(var i = 0; i < response.length; i++){
                if( response[i].message.substr(0, 8) == '<img cla'){
                    response[i].message = response[i].message.replace('.png','_small.png');
                    response[i].message = response[i].message.replace('.jpg','_small.jpg');
                }
            }
            self.displayChatMessages = response.reverse();
            $localStorage.roomMessageLength = self.displayChatMessages.length;
            $ionicScrollDelegate.scrollBottom(false);
        });
        roomOpenApi();

        function roomOpenApi() {
            var query = chatPageFactory.save({
                accessToken: userData.data.access_token,
                room_id: $stateParams.roomId,
                page: 0,
                limit: 20,
                currentTimestamp: _.now()
            });
            query.$promise.then(function(data) {
                socketService.update_message_status(data.data.messages, $stateParams.roomId);
                sqliteService.updateDbOnRoomOpen(data.data.messages, $stateParams.roomId).then(function() {
                    sqliteService.getMessageDataFromDB($stateParams.roomId).then(function(response) {
                        for(var i = 0; i < response.length; i++){
                            if( response[i].message.substr(0, 8) == '<img cla'){
                                response[i].message = response[i].message.replace('.png','_small.png');
                                response[i].message = response[i].message.replace('.jpg','_small.jpg');
                            }
                        }
                        self.displayChatMessages = response.reverse();
                        $scope.$evalAsync();
                        $ionicScrollDelegate.scrollBottom(false);
                    });
                });
            });
            $timeout(function() {
                $ionicScrollDelegate.scrollBottom(false);
            });
            //for sure message must be send once to server
            $timeout(function() {
                if(!timeStorage.get('network')){
                    sqliteService.deviceIsNowOnline();
                }
            }, 5000);
        }
        var doRefreshPageValue = 0;
        self.doRefresh = function() {
            var query = chatPageFactory.save({
                accessToken: userData.data.access_token,
                room_id: $stateParams.roomId,
                page: doRefreshPageValue,
                limit: 20,
                currentTimestamp: _.now()
            });
            query.$promise.then(function(data) {
                doRefreshPageValue++;
                $scope.$broadcast('scroll.refreshComplete');
            });

        };
        $scope.imgDownload = function(msguserId, chatpageID, msg, index) {

            var html = $.parseHTML(msg);
            var value = html[0].getAttribute("value");
            if(value){
                for (var i = 0; i < value.length; i++) {
                if (value[i] == ',') {
                        var lat_index = i;
                    }
                    if (value[i] == '}') {
                        var lng_index = i;
                    }
                }
                var show = value.substring(0, 5) + value.substring(lat_index, lat_index + 5);
                var lat = parseFloat(value.substring(5, lat_index));
                var lng = parseFloat(value.substring(lat_index + 5, lng_index));
                cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
                    if (!enabled) {
                        geoLocation.share();
                    } else {
                        if (show == '{lat:,lng:') {
                            $scope.map = {
                                center: {
                                    latitude: lat,
                                    longitude: lng
                                },
                                zoom: 15
                            };
                            $scope.options = {
                                scrollwheel: false
                            };
                            $scope.coordsUpdates = 0;
                            $scope.dynamicMoveCtr = 0;
                            $scope.marker = {
                                id: 0,
                                coords: {
                                    latitude: lat,
                                    longitude: lng
                                },
                                options: {
                                    draggable: true
                                },
                                events: {
                                    dragend: function(marker, eventName, args) {
                                        $log.log('marker dragend');
                                        var lat = marker.getPosition().lat();
                                        var lon = marker.getPosition().lng();
                                        $log.log(lat);
                                        $log.log(lon);

                                        $scope.marker.options = {
                                            draggable: true,
                                            labelContent: "lat: " + $scope.marker.coords.latitude + ' ' + 'lon: ' + $scope.marker.coords.longitude,
                                            labelAnchor: "100 0",
                                            labelClass: "marker-labels"
                                        };
                                    }
                                }
                            };
                            $scope.$watchCollection("marker.coords", function(newVal, oldVal) {
                                if (_.isEqual(newVal, oldVal))
                                    return;
                                $scope.coordsUpdates++;
                            });

                            $scope.mapUser.show();
                        } else {
                            console.log(msg);
                        }
                    }
                });
            } else{
                $ionicScrollDelegate.$getByHandle('zoom').zoomTo(1,true);
                if(msg.substr(msg.length - 5) == '.jpg>'){
                    $scope.fullViewImageSrc = msg.replace('_small.jpg','.jpg');    
                } else{
                    $scope.fullViewImageSrc = msg.replace('_small.png','.png');
                }
                $scope.fullViewImage.show();
            }
        };
        $ionicModal.fromTemplateUrl('mapUser.html', function($ionicModal) {
            $scope.mapUser = $ionicModal;
        }, {
            scope: $scope
        });
        $ionicModal.fromTemplateUrl('fullViewImage.html', function($ionicModal) {
            $scope.fullViewImage = $ionicModal;
        }, {
            scope: $scope
        });
        $scope.fullViewImageDownload = function(data){
            $scope.fullViewImageDownloadSpiner = true;

            var html = $.parseHTML(data);
            var url = html[0].getAttribute("src");
 
            // File name only
            var filename = url.split("/").pop();
             // window.open(url, '_system');
            // Save location
            var targetPath = cordova.file.externalRootDirectory + '/Download/' + filename;
            $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
                refreshMedia.refresh(targetPath);
                $scope.fullViewImageDownloadSpiner = false;
                tostService.notify('Image Downloaded', 'top');
            }, function (error) {
                $scope.fullViewImageDownloadSpiner = false;
                tostService.notify('Try Again', 'top');
            }, function (progress) {
                // PROGRESS HANDLING GOES HERE
                //  $timeout(function () {
                //     $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                // })
            });

        };
        var zoom = 0;
        $scope.zoomImage = function(){
            if(zoom == 0){
                $timeout(function() {
                    $ionicScrollDelegate.$getByHandle('zoom').zoomTo(4,true);
                });
                zoom = 1;
            } else{
                $timeout(function() {
                    $ionicScrollDelegate.$getByHandle('zoom').zoomTo(1,true);
                });
                zoom = 0;
            }
        }
    }
})();