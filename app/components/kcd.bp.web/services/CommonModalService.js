angular.module('kcd.bp.web.services').factory('CommonModalService', function ($modal, MODULE_ROOT) {
  'use strict';
  var templates = MODULE_ROOT + 'services/modal-templates/';

  return {
    confirm: confirm
  };

  function confirm(options) {
    return $modal.open({
      templateUrl: templates + 'confirmation-template.html',
      controller: function($scope) {
        $scope.header = options.header || 'Are you sure?';
        $scope.message = options.message;
        $scope.yesButton = options.yesButton || 'Yes';
        $scope.yesButtonClass = options.yesButtonClass || 'btn btn-danger';
        $scope.cancelButton = options.cancelButton || 'Cancel';
      }
    });
  }

});