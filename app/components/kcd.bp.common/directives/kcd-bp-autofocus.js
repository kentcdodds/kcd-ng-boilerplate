angular.module('kcd.bp.common.directives').directive('kcdBpAutofocus', function($timeout, $document) {
  'use strict';
  return {
    link: function(scope, element, attrs) {
      var previousEl = null;
      var el = element[0];
      var doc = $document[0];
      attrs.$observe('kcdBpAutofocus', function(value) {
        if(value && value !== 'false') {
          $timeout(function() {
            previousEl = doc.activeElement;
            el.focus();
          }, ~~attrs.focusWait);
        } else {
          if (previousEl && attrs.refocus && doc.activeElement === el) {
            el.blur();
            previousEl.focus();
          }
        }
      });
    }
  };
});