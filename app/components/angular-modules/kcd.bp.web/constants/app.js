(function() {
  'use strict';
  var app = angular.module('kcd.bp.web.constants', []);
  function addConstant(name) {
    if (window[name]) {
      app.constant(name, window[name]);
    } else {
      console.warn('Could not add ' + name + ' as a constant...');
    }
  }
  addConstant('toastr');

  var root = '/components/kcd.bp.web/';
  app.constant('MODULE_ROOT', root);
  app.constant('APP_ROOT', root + 'app/');
  app.constant('DIRECTIVE_ROOT', root + 'directives/');
})();