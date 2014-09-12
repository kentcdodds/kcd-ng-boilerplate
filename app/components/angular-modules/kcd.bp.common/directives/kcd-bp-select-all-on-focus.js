angular.module('kcd.bp.common.directives').directive('kcdBpSelectAllOnFocus', function() {
  'use strict';
  return function kcdBpSelectAllOnFocus(scope, el) {
    el.on('focus', function() {
      el.select();
    });
  };
});