angular.module('kcd.bp.web').config(function(APP_ROOT, $stateProvider, StateUtilsProvider) {
  'use strict';

  $stateProvider.state('root.auth', {
    abstract: true,
    url: '',
    template: StateUtilsProvider.divView
  });

  $stateProvider.state('root.auth.home', {
    url: '',
    templateUrl: APP_ROOT + 'home/HomeCtrl.html',
    controller: 'HomeCtrl'
  });
});