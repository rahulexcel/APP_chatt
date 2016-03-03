 (function() {
     'use strict';

     angular.module('starter')
         .controller('resetPasswordController', resetPasswordController);

     function resetPasswordController($state, resetPasswordFactory, timeStorage, tostService, $ionicLoading, $localStorage) {
         console.log('resetPasswordController');
         var self = this;
         self.email = timeStorage.get('userEmail');
         self.resetPassword = function() {
             if (self.password !== self.cpassword) {
                 tostService.notify('Your Password and Confirm Password not Match', 'top');
                 self.password = '';
                 self.cpassword = '';
             } else {
                 $ionicLoading.show();
                 var userData =  timeStorage.get('userData');
                 var accessToken = userData.data.access_token;
                 var query = resetPasswordFactory.save({
                     password:self.password,
                     access_token:accessToken
                 });
                 query.$promise.then(function(data) {
                     $ionicLoading.hide();
                     tostService.notify(data.message);
                     if(data.status == 1){
                        $localStorage.$reset();
                        $state.go('login');
                     }
                 });
             }
         };
     }
 })();