 (function() {
     'use strict';

     angular.module('starter')
         .controller('forgotPasswordController', forgotPasswordController);

     function forgotPasswordController($state, forgotPasswordFactory, tostService) {
         console.log('forgotPasswordController');
         var self = this;
         self.data = {
             email: ''
         }
         self.forgotPassword = function() {
             if (_.isEmpty(self.data.email)) {
                 tostService.notify('Email Address Required', 'top');
             } else {
                 self.forgotSpinner = true;
                 var query = forgotPasswordFactory.save({
                     email: self.data.email
                 });
                 query.$promise.then(function(data) {
                     console.log(data);
                     self.forgotSpinner = false;
                     tostService.notify(data.message, 'top');
                     if (data.status == 1) {
                         $state.go('login');
                     }
                 });
             }
         };
     }
 })();