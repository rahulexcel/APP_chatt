(function() {
    'use strict';

    angular.module('chattapp')
            .controller('profileController', profileController);

    function profileController(cameraService, profileImageFactory,sqliteService, $ionicLoading, profileFactory, $timeout, $ionicModal, timeStorage, $scope, $filter, $ionicPopup) {
        var self = this;
        self.displayProfile = timeStorage.get('profile_data');
        if (timeStorage.get('userData').data.access_token) {

            var query = profileFactory.save({
                accessToken: timeStorage.get('userData').data.access_token,
                currentTimestamp: Date.now()
            });
            query.$promise.then(function(data) {
                self.displayprofile = data.data;
                timeStorage.set('profile_data', self.displayprofile);

            });
        }

        self.editProfilePic = function() {
            $scope.myCroppedImage = '';
            cameraService.changePic().then(function(imageData) {
                $scope.modal.show();
                var img = "data:image/jpeg;base64," + imageData;
                $scope.myimage = img;
            }, function(err) {
                window.plugins.toast.showShortTop('Unable to retrieve image');
            });
        };

        $scope.result = function(image) {
            $scope.myCroppedImage = image;

        };
        self.status = function(status, demo) {
            self.data = {
                text: ''
            };
            if (status) {
                self.data.text = status;
            }
            else {
                self.data.text = demo;
            }
            var myPopup = $ionicPopup.show({
                template: '<input id="statustxt" type="text"  ng-model="profile.data.text">',
                title: 'Update status',
                subTitle: '',
                scope: $scope,
                buttons: [
                    {text: 'Cancel'},
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            var query = profileFactory.status({
                                accessToken: timeStorage.get('userData').data.access_token,
                                status: self.data.text,
                                currentTimestamp: Date.now()
                            });
                            query.$promise.then(function(data) {
                                if (data.status == 1) {
                                    self.displayprofile.profile_status = data.data.status;
                                    myPopup.close();

                                }
                                else {
                                    window.plugins.toast.showShortTop('status not update');
                                    myPopup.close();
                                }

                            });


                        }
                    }
                ]
            });
        };
        $ionicModal.fromTemplateUrl('app/profile/template/imgCropModal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        function fixBinary(bin) {
            var length = bin.length;
            var buf = new ArrayBuffer(length);
            var arr = new Uint8Array(buf);
            for (var i = 0; i < length; i++) {
                arr[i] = bin.charCodeAt(i);
            }
            return buf;
        }

        $scope.imgChange = function() {

            if ($scope.myCroppedImage) {
                $scope.startLoading = true;
                var imageBase64 = $scope.myCroppedImage.replace(/^data:image\/(png|jpeg);base64,/, "");
                var binary = fixBinary(atob(imageBase64));
                var blob = new Blob([binary], {type: 'image/png', name: 'png'});
                blob.name = 'png';
                blob.$ngfName = 'png';

                var query = profileImageFactory.upload({
                    file: blob,
                    currentTimestamp: Date.now(),
                    append_data: {file_type: 'profile_image', accessToken: timeStorage.get('userData').data.access_token}

                });
                query.then(function(data) {

                    if (data.data.status == 1) {
                        self.displayprofile.profile_image = data.data.data.url;
                        $scope.startLoading = false;
                        var pr_image = timeStorage.get('userData');
                        pr_image.data.profile_image = self.displayprofile.profile_image;
                        console.log(pr_image);
                        sqliteService.updateUserProfie(self.displayprofile.profile_image);
                        $scope.modal.hide();
                    } else {
                        $scope.startLoading = false;
                        window.plugins.toast.showShortTop('Image not upload');
                    }
                });

            } else {
                window.plugins.toast.showShortTop('Please set your pic');
            }
        };
        $scope.imgCancel = function() {
            $scope.modal.hide();
        };
        $scope.stopLoading = function() {
            $scope.startLoading = false;
            $scope.start = false;
        };
    }

})();