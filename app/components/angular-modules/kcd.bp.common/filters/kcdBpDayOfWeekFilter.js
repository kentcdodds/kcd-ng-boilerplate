angular.module('kcd.bp.common.filters').filter('kcdBpDayOfWeekFilter', function() {
  'use strict';
  var weekdays = [
    'Sunday', 'Monday', 'Tuesday',
    'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  return function(input) {
    return weekdays[input];
  };
});