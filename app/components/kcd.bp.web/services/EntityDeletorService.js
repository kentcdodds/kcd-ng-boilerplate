angular.module('kcd.bp.web.services').factory('EntityDeletorService', function(CommonModalService, DS, AlertEventBroadcaster, ErrorDisplayService) {
  'use strict';
  return {
    deleteResource: deleteResource
  };

  function deleteResource(resourceType, resourceId, resourceDisplayName) {
    var onError = ErrorDisplayService.getErrorResponseHandler();
    var resourceDefinition = DS.definitions[resourceType];
    var displayName = resourceDefinition.meta.getDisplayName();
    var promise = CommonModalService.confirm({
      header: 'Are you sure you want to delete "' + resourceDisplayName + '" ' + displayName + '?',
      message: 'Deleting this ' + displayName + ' cannot be undone!',
      yesButton: 'Delete'
    }).result;

    promise.then(function(yes) {
      if (yes) {
        return DS.destroy(resourceType, resourceId).then(function() {
          AlertEventBroadcaster.broadcast({
            type: 'info',
            message: displayName + ' successfully deleted'
          });
        }, onError);
      } else {
        return null;
      }
    });

    return promise;
  }
});