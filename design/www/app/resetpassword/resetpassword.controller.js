 (function() {
     'use strict';

     angular.module('starter')
         .controller('resetPasswordController', resetPasswordController);

     function resetPasswordController($state, resetPasswordFactory, timeStorage, tostService, $ionicLoading) {
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
                 var query = resetPasswordFactory.save({
                     email: self.data.email
                 });
                 query.$promise.then(function(data) {
                     $ionicLoading.hide();
                     tostService.notify(data.message);
                 });
             }
         };
     }
 })();