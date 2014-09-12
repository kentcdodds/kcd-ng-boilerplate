angular.module('kcd.bp.common.services').factory('UtilService', function(API_V1_URL, $upload) {
  'use strict';
  return {
    uploadAvatar: uploadAvatar
  };

  function uploadAvatar(file) {
    return $upload.upload({
      method: 'POST',
      url: API_V1_URL + 'users/avatar',
      file: file,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
});