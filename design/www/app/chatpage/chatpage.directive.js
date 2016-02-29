 (function() {
     'use strict';

     angular.module('starter')

     .directive('chatPageHeader', function() {
         var directive = {};
         directive.restrict = 'E';
         directive.template = "<ion-header-bar class='bar-stable chatpage-header'><button ng-click='chatPage.goBack()' class='button back-button buttons  button-clear header-item'><i class='icon ion-ios-arrow-back'></i></button><img class='img-circle' ng-src='{{chatPage.image}}'><p><strong>{{chatPage.name}} </strong><br><span>{{chatPage.lastSeen}}</span></p><button class='button button-clear pull-right'><i class='icon ion-android-more-vertical'></i></button></ion-header-bar>";
         directive.scope = {
             chatPage: "=header"
         }
         directive.compile = function(element, attributes) {
             var linkFunction = function($scope, element, attributes) {}
             return linkFunction;
         }
         return directive;
     })
     .directive('chatPageFooter', function() {
         var directive = {};
         directive.restrict = 'E';
         directive.template = "<ion-footer-bar class='bar bar-stable'><div class='p-h-md footer'><a class='pull-left w-40 m-r'><img ng-src='{{chatPageFooter.image}}' class='w-full img-circle'></a></div><input type='text' class='form-control text-box'><button class='button button-positive send-msg' ng-click='chatPageFooter.sendMessage()'><i class='icon ion-paper-airplane'></i></button></ion-fotter-bar>";
         directive.scope = {
             chatPageFooter: "=footer"
         }
         directive.compile = function(element, attributes) {
             var linkFunction = function($scope, element, attributes) {}
             return linkFunction;
         }
         return directive;
     });
 })();