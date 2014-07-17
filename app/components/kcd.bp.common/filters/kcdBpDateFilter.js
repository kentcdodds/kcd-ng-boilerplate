angular.module('kcd.bp.common.filters').filter('kcdBpDateFilter', function($filter) {
  'use strict';
  /* jshint quotmark: false */
  return function kcdBpDate(date, filter) {
    return $filter('date')(date, filter || "MMM d, yyyy',' h:mm a");
  };
});