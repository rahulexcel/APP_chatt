 (function() {
     'use strict';

     angular.module('starter')
         .controller('contactsController', contactsController);

     function contactsController(contactsFactory) {
         console.log('contactsController');
         var self = this;
         var query = contactsFactory.query({
             user_id: '123456'
         });
         query.$promise.then(function(data) {
             console.log(data);
             self.displaycontacts = data;
         });
     }
 })();