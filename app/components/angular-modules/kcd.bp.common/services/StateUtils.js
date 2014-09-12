angular.module('kcd.bp.web.services').provider('StateUtils', function(_) {
  'use strict';
  var rootUrl = '/';
  var divView = '<div ui-view></div>';
  var absoluteDivView = '<div class="position-relative"><div ui-view class="animated-view"></div></div>';
  var injector;
  _.extend(this, {
    rootUrl: rootUrl,
    divView: divView,
    absoluteDivView: absoluteDivView,
    resolveParameter: resolveParameter,
    resolveAuth: resolveAuth,
    resolveDS: resolveDS,
    findAll: findAll,
    resolveDSWithParam: resolveDSWithParam,
    resolveIdentity: resolveIdentity,
    resolveNewResource: resolveNewResource,
    resolveAdmins: resolveAdmins,
    resolveRandom: resolveRandom,
    goBack: function goBackWrapper() {
      getInjector().invoke(['$state', goBack]);
    },
    $get: function StateUtilsGet() {
      return this;
    }
  });

  function resolveParameter(param) {
    return /*@ngInject*/ function($stateParams) {
      return $stateParams[param];
    };
  }

  function resolveAuth() {
    return /*@ngInject*/ function (LoginState) {
      return LoginState.isAuthenticated();
    };
  }

  function resolveDS(method, args) {
    return /*@ngInject*/ function(DS) {
      var instanceArgs = arrayify(args); // instanceArgs must exist because angular-data's doing something funky...
      if (method === 'findAll' && instanceArgs.length === 1) {
        instanceArgs.push({});
      }
      return DS[method].apply(DS, instanceArgs);
    };
  }

  function findAll(what) {
    return resolveDS('findAll', what);
  }

  function resolveDSWithParam(type, param) {
    return /*@ngInject*/ function($stateParams, DS) {
      var id = $stateParams[param];
      var item = DS.get(type, id);
      if (item) {
        return item;
      } else {
        return DS.find(type, id);
      }
    };
  }

  function resolveNewResource(type) {
    return /*@ngInject*/ function newResource(DS) {
      return DS.definitions[type].meta.createInstance();
    };
  }

  function resolveAdmins(type, idParam) {
    return /*@ngInject*/ function admins(API_V1_URL, $http, $stateParams, DS, _) {
      var resourceId = $stateParams[idParam];
      var endpoint = DS.definitions[type].endpoint;
      return $http.get(API_V1_URL + endpoint + '/' + resourceId + '/admins').then(function(response) {
        _.each(response.data, function(adminGroup, groupName) {
          response.data[groupName] = _.map(adminGroup, function(admin) {
            return {
              id: admin.id,
              user: DS.definitions.user.meta.createInstance(admin.user)
            };
          });
        });
        return response.data;
      });
    };
  }

  function resolveIdentity(val) {
    return function() {
      return val;
    };
  }

  function resolveRandom(what) {
    return /*@ngInject*/ function(DS, $q) {
      if (_.isEmpty(DS.store[what].collection)) {
        var deferred = $q.defer();
        DS.findAll(what).then(function(whats) {
          deferred.resolve(_.sample(whats));
        }, deferred.reject);
        return deferred;
      } else {
        return _.sample(DS.store[what].collection);
      }
    };
  }

  function goBack($state) {
    $state.go($state.previousState, $state.previousParams);
  }

  function arrayify(obj) {
    return angular.isArray(obj) ? obj : [obj];
  }

  function getInjector() {
    if (!injector) {
      injector = angular.element(document.getElementsByTagName('html')[0]).injector();
    }
    return injector;
  }
});