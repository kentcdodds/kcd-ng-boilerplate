angular.module('kcd.bp.common.services').factory('AuthService', function(API_V1_URL, $http, LoginState, _) {
  'use strict';
  return {
    register: register,
    login: login,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword
  };

  function register(data) {
    return _loginOrRegister({
      url: API_V1_URL + 'register',
      data: data,
      transformRequest: angular.identity
    });
  }

  function login(data) {
    return _loginOrRegister({
      url: API_V1_URL + 'login',
      data: {
        email: data.email,
        password: data.password
      }
    });
  }

  function _loginOrRegister(config) {
    var headers = config.headers || {};
    return $http(_.extend(config, {
      method: 'POST',
      headers: headers
    })).then(function(response) {
      var token = response.data.token;
      if (token) {
        LoginState.setToken(token);
      }
      return response;
    }, function(err) {
      LoginState.clearToken();
      throw err;
    });
  }

  function forgotPassword(email) {
    return $http({
      method: 'POST',
      url: API_V1_URL + 'password/reset',
      data: {
        email: email
      }
    });
  }

  function resetPassword(newPassword, userId, key) {
    return $http({
      method: 'POST',
      url: API_V1_URL + 'password/reset/' + userId + '-' + key,
      data: {
        password1: newPassword,
        password2: newPassword
      }
    });
  }
});