/*
 * The kcd.bp.common module combines all kcd.bp.common.* modules. The providers in this module
 * can be shared between the browser and a mobile app for PhoneGap (built with ionic for example).
 */
angular.module('kcd.bp.common', [
  'kcd.bp.common.constants',
  'kcd.bp.common.services',
  'kcd.bp.common.filters',
  'kcd.bp.common.directives'
]);