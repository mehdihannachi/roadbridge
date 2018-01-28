//dashboardController contoller 
roadbridge.controller('updateController', function($scope, $http, $resource, $window, $state, $sessionStorage, $rootScope, $timeout, uuid, fileReader) {

    $scope.image = {};
    var url = window.location.pathname
    var projectId = url.split('/project_update/')[1];
    $rootScope.project
    $scope.user_files = []
    $rootScope.initProject = function() {

        var Project = $resource('/project/show/' + projectId);
        Project.get().$promise.then(function(result) {
            console.log(result)
            $rootScope.project = result
            $scope.imageSrc = '/public/img/' + $rootScope.project.cover_photo;
            // $scope.drafts = $scope.articles.filter(function(article) {
            //     return (article.as_draft == true);
            // })
            // $scope.published = $scope.articles.filter(function(article) {
            //     return (article.as_draft == false);
            // })

            if (result.error) {
                $scope.error = true;
                $scope.errorMSG = result.error
            }
        });
    }
    $rootScope.initProject();

    $scope.uploadfiles = function() {
        $('#upload_input').click();
    }

    $scope.getFile = function() {
        $scope.progress = 0;
        fileReader.readAsDataUrl($scope.file, $scope)
            .then(function(result) {
                $scope.imageSrc = result;
            });
    };

    $scope.$on("fileProgress", function(e, progress) {
        $scope.progress = progress.loaded / progress.total;
    });

    //render the update page (save the article in session storage)  
    $scope.updateProject = function(valid, id) {
        if (valid) {
            $(".overlay").show();
            console.log('is valid')

            var files = $('#upload_input').get(0).files;

            if (files.length > 0) {
                // create a FormData object which will be sent as the data payload in the
                var formData = new FormData();

                // loop through all the selected files and add them to the formData object
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    var newfile = {};

                    newfile.style = "background: #21f36e;"
                    var x = uuid.v4() + file.name;

                    newfile.name = x;

                    // $scope.user.files.push(file)
                    $scope.user_files.push(newfile)
                    // add the files to formData object for the data payload
                    formData.append('uploads[]', file, x);

                }
                $scope.isSaving = true;
                $http.post("/project/file_upload/",
                        formData, {
                            headers: {
                                'Content-Type': undefined
                            }
                        })
                    .then(function(success) {
                        $http.post("/project/update/" + id, {
                                contract_title: $scope.project.contract_title,
                                start_date_month: $scope.project.start_date_month,
                                start_date_year: $scope.project.start_date_year,
                                end_date_year: $scope.project.end_date_year,
                                end_date_month: $scope.project.end_date_month,
                                description: $scope.project.description,
                                client: $scope.project.client,
                                consultant: $scope.project.consultant,
                                referee: $scope.project.referee,
                                cover_photo: x
                            })
                            .then(function(success) {
                                $scope.isSaving = false;
                                window.location.href = "/projects_list";
                            })
                    })

            }
            else {
                $scope.isSaving = true;
                $http.post("/project/update/" + id, {
                        contract_title: $scope.project.contract_title,
                        start_date_month: $scope.project.start_date_month,
                        start_date_year: $scope.project.start_date_year,
                        end_date_year: $scope.project.end_date_year,
                        end_date_month: $scope.project.end_date_month,
                        description: $scope.project.description,
                        client: $scope.project.client,
                        consultant: $scope.project.consultant,
                        referee: $scope.project.referee
                    })
                    .then(function(success) {
                        $scope.isSaving = false;
                        window.location.href = "/projects_list";
                    })
            }



        }
    }

});
