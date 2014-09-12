(function() {
  'use strict';

  var app = angular.module('kcd.bp.common.constants', []);
  function addConstant(name) {
    if (window[name]) {
      app.constant(name, window[name]);
    }
  }
  addConstant('_');
  addConstant('moment');
  addConstant('pluralize');

  app.constant('APP_NAME', window.KCDBP.APP_NAME);
  app.constant('BASE_URL', '/');
  app.constant('COMMON_IMAGES', '/components/kcd.bp.common/images/');

  // from angular - https://github.com/angular/angular.js/commit/79e519fedaec54390a8bdacfb1926bfce57a1eb6
  app.constant('EMAIL_REGEXP', /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i);
})();