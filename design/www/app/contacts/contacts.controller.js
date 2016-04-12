(function() {
    'use strict';

    angular.module('chattapp')
            .controller('contactsController', contactsController);

    function contactsController($scope, contactsFactory, $filter, contactsService, $ionicLoading, timeStorage, $localStorage, $state, socketService, $ionicModal, getUserProfileFactory) {
        delete $localStorage.chatWithUserData;
        var self = this;
        var userData = timeStorage.get('userData');
        var accessToken = userData.data.access_token;
        self.displaycontacts = timeStorage.get('listUsers');
        contactsService.listUsers();
        $scope.$on('updatedlistUsers', function(event, response) {
            self.displaycontacts = response.data;
            $scope.$evalAsync();
        });
        self.chatWithUser = function(name, id, pic, lastSeen) {
            self.startChatspinner = true;
            var chatWithUser = {
                "name": name,
                "id": id,
                "pic": pic,
                "lastSeen": lastSeen
            }
            timeStorage.set('chatWithUserData', chatWithUser, 1);
            socketService.create_room(id).then(function(data) {
                $scope.modal.hide();
                $state.go('app.chatpage', {roomId: data.data.room_id});
            });
        }
        self.isSearchOpen = false;
        self.searchOpen = function() {
            if (self.isSearchOpen) {
                self.isSearchOpen = false;
            } else {
                self.isSearchOpen = true;
            }
        }
        self.openUserProfile = function(clickData, index) {
            self.spinnerIndex = index;
            var userData = timeStorage.get('userData');
            var query = getUserProfileFactory.save({
                accessToken: userData.data.access_token,
                user_id: clickData.id,
                currentTimestamp: _.now()
            });
            query.$promise.then(function(data) {
                self.spinnerIndex = -1;
                self.displayUserProfileName = data.data.name;
                self.displayUserProfileId = data.data.user_id;
                if (data.data.profile_image) {
                    self.displayUserProfileImage = data.data.profile_image;
                }
                else {
                    self.displayUserProfileImage ="https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg";
                }
                self.date = $filter('date')(new Date(data.data.last_seen * 1000), "MMM d, y");
                if ($filter('date')(new Date().toDateString(), "MMM d, y") == self.date) {
                    self.displayUserProfileLastSeen = $filter('date')(new Date(data.data.last_seen * 1000), "hh:mm a");
                } else {
                    self.displayUserProfileLastSeen = $filter('date')(new Date(data.data.last_seen * 1000), "MMM d y hh:mm a");
                }
//                    self.displayUserProfileLastSeen = data.data.last_seen;
                self.displayUserProfilePrivateRooms = data.data.user_private_rooms;
                self.displayUserProfilePublicRooms = data.data.user_public_rooms;
                self.displayUserProfileStatus = data.data.profile_status;
                $scope.modal.show();
            });
        }
        $ionicModal.fromTemplateUrl('contactUser.html', function($ionicModal) {
            $scope.modal = $ionicModal;
        }, {
            scope: $scope,
        });
    }
})();