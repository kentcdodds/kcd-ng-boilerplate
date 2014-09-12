(function() {
  'use strict';

  var deps = [
    // third party mods
    'ui.router', 'ui.bootstrap', 'angularFileUpload', 'Scope.$safeApply', 'Scope.$watchOnce',

    // angular mods
    'ngAnimate',

    // internal mods
    'kcd.bp.common',

    'kcd.bp.web.constants',
    'kcd.bp.web.services',
    'kcd.bp.web.directives'
  ];
  var app = angular.module('kcd.bp.web', deps);

  // This is config for the whole kcd.bp.web module. Each feature has its own config to setup it's own routing.
  // It is assumed that this file is loaded after the feature's config files are and is therefore run last.
  app.config(function ($stateProvider, $urlRouterProvider, $locationProvider, _, StateUtilsProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider.state('root', {
      abstract: true,
      url: StateUtilsProvider.rootUrl,
      template: StateUtilsProvider.divView,
      resolve: {
        isAuthenticated: StateUtilsProvider.resolveAuth()
      }
    });

    $stateProvider.state('root.logout', {
      url: 'logout',
      controller: function(LoginState, $state, DS) {
        LoginState.logout();
        angular.forEach(Object.keys(DS.definitions), function(resourceName) {
          DS.ejectAll(resourceName);
        });
        $state.go('root.anon.noInitialState');
      }
    });

    $stateProvider.state('root.error', {
      url: 'error',
      template: '<div class="text-align-center margin-xxlarge">' +
        '<h1>Whoops!</h1>' +
        '<div>Something weird happened... <a href="/">Click here...</a> Or refresh your browser</div>' +
        '</div>'
    });

    $urlRouterProvider.otherwise(StateUtilsProvider.rootUrl);
  });

  app.run(function($rootScope, $state, AlertEventBroadcaster, $location, LoginState) {

    // Initialize the AlertEventBroadcaster
    var alertEvents = [
      { name: '$stateChangeError', type: 'error', message: 'Something weird happened...' }
    ];
    AlertEventBroadcaster.initialize(alertEvents);

    var authState = 'root.auth.home';
    var anonState = 'root.anon.noInitialState';

    // if the login state changes, route the user to the correct state
    $rootScope.$on('login.change', function(event, authenticated) {
      if (!authenticated && /root\.auth/.test($state.current.name)) {
        $state.go(anonState);
      } else if (authenticated && /root\.anon/.test($state.current.name)) {
        $state.go(authState);
      }
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      console.log('$stateChangeStart: ' + toState.name);

      // If the user is going to an auth state, reroute them to an anon state if they're not authenticated and vice-versa.
      if (/root\.auth/.test(toState.name)) {
        if (!LoginState.isAuthenticated()) {
          event.preventDefault();
          $state.go(anonState);
        }
      } else if (/root\.anon/.test(toState.name)) {
        if ($state.current.name === authState) {
          event.preventDefault();
        } else if (LoginState.isAuthenticated()) {
          event.preventDefault();
          $state.go(authState);
        }
      }
    });

    var stateChangeErrors = 0;
    // Prevent error recursion on state changes
    $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
      console.error('$stateChangeError: ' + toState.name);
      console.error(event);
      stateChangeErrors++;
      if (stateChangeErrors > 10) {
        $state.go('error');
        LoginState.clearToken();
      } else {
        $state.go(anonState);
      }
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
      console.log('$stateChangeSuccess: ' + toState.name);
      // When there's success, reset state change errors
      stateChangeErrors = 0;

      fromState = fromState.name ? fromState : $state.get(anonState);
      $state.previousState = fromState;
      $state.previousParams = fromParams || {};
    });
  });
})();