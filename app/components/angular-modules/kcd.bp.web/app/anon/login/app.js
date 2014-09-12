angular.module('kcd.bp.web').config(function(APP_ROOT, $stateProvider, StateUtilsProvider) {
  'use strict';

  var loginCtrlTemplate = APP_ROOT + 'anon/login/LoginCtrl.html';
  var loginCtrl = 'LoginCtrl';

  $stateProvider.state('root.anon', {
    abstract: true,
    url: '',
    template: StateUtilsProvider.divView,
    resolve: {
      initialState: StateUtilsProvider.resolveIdentity({}),
      uid: StateUtilsProvider.resolveIdentity(''),
      key: StateUtilsProvider.resolveIdentity('')
    }
  });

  $stateProvider.state('root.anon.noInitialState', {
    url: '',
    templateUrl: loginCtrlTemplate,
    controller: loginCtrl
  });

  $stateProvider.state('root.anon.initialState', {
    url: '{state:sign-up|forgot-password}',
    templateUrl: loginCtrlTemplate,
    controller: loginCtrl,
    resolve: {
      initialState: function($stateParams) {
        var state = $stateParams.state;
        return {
          isRegistering: state === 'sign-up',
          isForgotPassword: state === 'forgot-password'
        };
      }
    }
  });

  $stateProvider.state('root.anon.resetPassword', {
    url: 'reset-password/:uid/:key',
    templateUrl: loginCtrlTemplate,
    controller: loginCtrl,
    resolve: {
      initialState: StateUtilsProvider.resolveIdentity({ isResetPassword: true }),
      uid: StateUtilsProvider.resolveParameter('uid'),
      key: StateUtilsProvider.resolveParameter('key')
    }
  });
});