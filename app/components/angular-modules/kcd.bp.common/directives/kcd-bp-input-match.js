angular.module('kcd.bp.common.directives').directive('kcdBpInputMatch', function() {
  'use strict';
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function(scope, elem, attrs, ctrl) {
      scope.$watch(function() {
        return attrs.kcdBpInputMatch === ctrl.$modelValue;
      }, function(currentValue) {
        ctrl.$setValidity('match', currentValue);
      });
    }
  };
});