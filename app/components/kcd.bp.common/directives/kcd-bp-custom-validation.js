/*
 * Provide an arry to this attribute directive that's structured like so:
 * [
 *   {
 *     name: 'has-id',
 *     fn: function(value) {
 *       return value && !!value.id;
 *     },
 *     watch: 'value' // will watch 'value' on the scope of the element this is on.
 *   },
 *   {
 *     name: 'other-custom',
 *     fn: function(value) {
 *       return /other/.test(value);
 *     }
 *     // no watch means this will simply be added to the controller's $parsers and invoked with the viewValue.
 *   }
 * ]
 */
angular.module('kcd.bp.common.directives').directive('kcdBpCustomValidation', function($timeout) {
  'use strict';

  return {
    require: 'ngModel',
    link: function(scope, el, attrs, ctrl) {
      // the kcdBpCustomValidation is not always immediately available
      var stopWatching = scope.$watchOnce(attrs.kcdBpCustomValidation, setupValidators);
      // but it is totally valid to not have it defined at all, so we'll cancel the watch after a while...
      $timeout(stopWatching, 1000);

      function setupValidators(validators) {
        if (!angular.isArray(validators)) {
          validators = [validators];
        }
        // setup watchers and parsers
        angular.forEach(validators, function(validator) {
          if (validator.watch) {
            scope.$watch(validator.watch, function(value) {
              applyValidity(validator, value);
            });
          } else {
            ctrl.$parsers.unshift(function(viewValue) {
              applyValidity(validator, viewValue);
              return viewValue;
            });
          }
        });
      }

      function applyValidity(validator, value) {
        if (validator.fn(value)) {
          ctrl.$setValidity(validator.name, true);
        } else {
          ctrl.$setValidity(validator.name, false);
        }
      }
    }
  };
});