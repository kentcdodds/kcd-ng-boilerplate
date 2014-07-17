angular.module('kcd.bp.common.directives').directive('kcdBpDynamicName', function() {
  'use strict';
  return {
    restrict: 'A',
    priority: 599, // one after ngIf
    controller: function($scope, $element, $attrs) {
      $element.removeAttr('kcd-bp-dynamic-name');
      $attrs.$set('name', $scope.$eval($attrs.kcdBpDynamicName));
      delete $attrs.kcdBpDynamicName;
    }
  };
});