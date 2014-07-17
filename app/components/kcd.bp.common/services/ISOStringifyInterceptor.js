/*
 * This interceptor's purpose is to replace any date field with an ISO string in request data
 */
angular.module('kcd.bp.common.services').factory('ISOStringifyInterceptor', function (moment) {
  'use strict';
  return {
    request: function (config) {
      if (angular.isObject(config.data)) {
        config.data = isoStringify(config.data);
      }
      return config;
    }
  };

  function isoStringify(data) {
    if (angular.isObject(data)) {
      return angular.forEach(data, function(value, key) {
        data[key] = isoStringify(value);
      });
    }
    if (angular.isDate(data)) {
      data = moment(data).zone('-06:00').toISOString();
    }
    return data;
  }
});