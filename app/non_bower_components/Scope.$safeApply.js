/**
 * @name Scope.$safeApply
 * @fileOverview The Scope.$safeApply module adds $safeApply functionality to your $scope
 *
 * http://www.github.com/kentcdodds/safeApply - does not exist... yet...
 *
 * @license Scope.$safeApply may be freely distributed under the MIT license.
 * @copyright (c) 2014 Kent C. Dodds
 * @author Kent C. Dodds <kent@doddsfamily.us> (http://kent.doddsfamily.us)
 */
angular.module('Scope.$safeApply', []).run(['$rootScope', function($rootScope) {
  'use strict';

  // force all $newed up scopes to have the $safeApply
  var scopePrototype = Object.getPrototypeOf($rootScope);
  var oldNew = scopePrototype.$new;
  scopePrototype.$new = function $new() {
    var scope = oldNew.apply(this, arguments);
    addSafeApply(scope);
    return scope;
  };

  // add $safeApply to $rootScope
  addSafeApply($rootScope);


  // FUNCTIONS

  function addSafeApply(scope) {
    scope.$safeApply = scope.$safeApply || $safeApply;
  }

  function $safeApply() {
    var $scope, fn, force = false;
    if (arguments.length == 1) {
      var arg = arguments[0];
      if (typeof arg == 'function') {
        fn = arg;
      } else {
        $scope = arg;
      }
    } else {
      $scope = arguments[0];
      fn = arguments[1];
      if (arguments.length == 3) {
        force = !!arguments[2];
      }
    }

    $scope = $scope || this;
    fn = fn || angular.noop;
    if (force || !$scope.$$phase) {
      $scope.$apply ? $scope.$apply(fn) : $scope.apply(fn);
    } else {
      fn();
    }
  }
}]);