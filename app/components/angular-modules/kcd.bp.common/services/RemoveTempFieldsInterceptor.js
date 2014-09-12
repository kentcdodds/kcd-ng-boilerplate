/*
 * This interceptor's purpose is to remove any request data values that begin with "TEMP_FIELD"
 */
angular.module('kcd.bp.common.services').factory('RemoveTempFieldsInterceptor', function () {
  'use strict';
  return {
    request: function (config) {
      if (angular.isObject(config.data)) {
        config.data = removeTempIds(config.data);
      }
      return config;
    }
  };

  function removeTempIds(data) {
    if (angular.isObject(data)) {
      return angular.forEach(data, function(value, key) {
        data[key] = removeTempIds(value);
      });
    }
    if (!angular.isString(data) || data.indexOf('TEMP_FIELD') !== 0) {
      return data;
    }
  }
});