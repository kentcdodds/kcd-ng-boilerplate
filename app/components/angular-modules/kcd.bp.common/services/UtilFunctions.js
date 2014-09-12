angular.module('kcd.bp.common.services').factory('UtilFunctions', function() {
  'use strict';
  return {
    s4: s4,
    guid: guid,
    titleize: titleize
  };

  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  function guid() {
    return s4() + s4() + s4() + s4();
  }

  function titleize(string) {
    if (!string) {
      return '';
    }
    return string.toLowerCase().replace(/(?:^|\s|-)\S/g, function(c) {
      return c.toUpperCase();
    });
  }

});