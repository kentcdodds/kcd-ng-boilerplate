angular.module('kcd.bp.common.services').factory('LoginState', function($rootScope, $window, AlertEventBroadcaster) {
  'use strict';
  var tokenKey = 'user-token';
  var userToken = null;

  return {
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    logout: logout,
    broadcastChange: broadcastChange,
    isAuthenticated: isAuthenticated
  };

  function getToken() {
    if (!userToken) {
      userToken = $window.localStorage.getItem(tokenKey);
    }
    return userToken;
  }

  function isAuthenticated() {
    return !!getToken();
  }

  function setToken(token) {
    $window.localStorage.setItem(tokenKey, token);
    userToken = token;
    broadcastChange(true);
  }

  function logout() {
    $window.localStorage.removeItem(tokenKey);
    userToken = null;
    broadcastChange(true);
  }

  function clearToken() {
    $window.localStorage.removeItem(tokenKey);
    userToken = null;
    broadcastChange();
  }

  function broadcastChange(alert) {
    var authenticated = isAuthenticated();
    $rootScope.$broadcast('login.change', authenticated);
    if (!alert) {
      return;
    }
    if (authenticated) {
      AlertEventBroadcaster.broadcast({
        type: 'info',
        message: 'Welcome back!',
        title: 'Hey there!'
      });
    } else {
      AlertEventBroadcaster.broadcast({
        type: 'info',
        message: 'See you again soon!',
        title: 'Bye!'
      });
    }
  }
});