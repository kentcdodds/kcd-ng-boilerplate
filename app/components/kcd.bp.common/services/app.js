(function() {
  'use strict';

  var app = angular.module('kcd.bp.common.services', ['angular-data.DSCacheFactory', 'angular-data.DS', 'kcd.bp.common.constants']);

  var apiUrl = window.KCDBP ? window.KCDBP.API_V1_URL : '/';

  app.config(function ($httpProvider, DSProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
    $httpProvider.interceptors.push('RemoveTempFieldsInterceptor');
    $httpProvider.interceptors.push('ISOStringifyInterceptor');
    DSProvider.defaults.baseUrl = apiUrl;
  });

  app.constant('API_V1_URL', apiUrl);

  app.run(function($window, DS, $templateCache, DSHttpAdapter, _, CurrentUserService, LoginState, pluralize, UtilFunctions) {
    // If we're on dev, then add a few things to the global KCDBP object for debugging.
    if ($window.KCDBP && $window.KCDBP.onDev) {
      $window.KCDBP.DS = DS;
      $window.KCDBP.$templateCache = $templateCache;
    }

    // Registration of models

    // All resources should be defined at this point
    var resourceNames = Object.keys(DS.definitions);
    // Add common meta data on all definitions
    angular.forEach(resourceNames, function(resourceName) {
      var definition = DS.definitions[resourceName];
      definition.meta = definition.meta || {};

      // add createInstance
      var ResourceClass = definition[definition.class] || Object;
      definition.meta.createInstance = function(attrs) {
        var instance = new ResourceClass();
        return angular.extend(instance, attrs);
      };

      // add displayName
      definition.meta.displayName = definition.meta.displayName || UtilFunctions.titleize(definition.name);
      definition.meta.getDisplayName = function getDisplayName() {
        return definition.meta.displayName;
      };
    });

    if (LoginState.isAuthenticated()) {
      CurrentUserService.getUser();
    }

  });
})();
