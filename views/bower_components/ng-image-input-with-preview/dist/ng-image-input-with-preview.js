roadbridge.controller('UploadController', function($scope, fileReader, $rootScope) {

  $scope.getFile = function() {

    fileReader.readAsDataUrl($scope.file, $scope)
      .then(function(result) {
        $rootScope.imageSrc = result;
      });
  };

});

roadbridge.directive("ngFileSelect", function() {

  return {
    link: function($scope, el) {

      el.bind("change", function(e) {

        $scope.file = (e.srcElement || e.target).files[0];
        $scope.getFile();
      })

    }

  }


})
