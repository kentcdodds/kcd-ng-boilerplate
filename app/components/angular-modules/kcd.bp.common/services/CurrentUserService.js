angular.module('kcd.bp.common.services').factory('CurrentUserService', function($rootScope, $log, $q, $http, DS, API_V1_URL, LoginState) {
  'use strict';

  var currentUser = null;

  $rootScope.$on('login.change', function(event, authenticated) {
    if (!authenticated) {
      clearUser();
    } else {
      getUser(true);
    }
  });

  return {
    getUser: getUser,
    clearUser: clearUser,
    saveUser: saveUser
  };

  function getUser(noCache) {
    var deferred = $q.defer();
    if (!currentUser || noCache) {
      $http({
        method: 'GET',
        url: API_V1_URL + 'users/me'
      }).then(function(response) {
        if (response.data) {
          currentUser = $rootScope.currentUser = DS.inject('user', response.data);
          $rootScope.$broadcast('user.refreshed.success', currentUser);
          deferred.resolve(currentUser);
        } else {
          clearUser();
          LoginState.logout();
          deferred.reject('Trying to get the current user returned no data.');
        }
      }, function(err) {
        $log.error(err);
        LoginState.logout();
        clearUser();
        deferred.reject(err);
      });
    } else {
      deferred.resolve(currentUser);
    }
    return deferred.promise;
  }

  function clearUser() {
    if (currentUser || $rootScope.currentUser) {
      DS.eject('user', currentUser ? currentUser.id : $rootScope.currentUser.id);
    }
    $rootScope.currentUser = currentUser = null;
  }

  function saveUser() {
    var user = currentUser || $rootScope.currentUser;
    var serializedUser = DS.defaults.serialize('user', user);
    return $http({
      method: 'PUT',
      url: API_V1_URL + 'users/me',
      data: serializedUser
    });
  }
});