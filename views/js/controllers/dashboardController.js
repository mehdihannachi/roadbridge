//dashboardController contoller 
roadbridge.controller('dashboardController', function($scope, $http, $resource, $window, $state, $sessionStorage, $rootScope, $timeout, uuid, fileReader) {
    $rootScope.initProjects = function() {
        $scope.ShowOption = 'Show All'
        $scope.isSaving = false;
        $scope.image = {};
        console.log('helllo')
        //get all Projects article available (draft and published)
        $scope.allArticles = 1;
        $scope.draftArticles = 0;
        $scope.publishedArticles = 0;
        $scope.searchArticle;
        $scope.article;
        $scope.articles = [];
        $scope.user_files = []
        var ProjectsAll = $resource('/projects');
        ProjectsAll.get().$promise.then(function(result) {
            console.log(result)
            $scope.projects = result.projects


            if (result.error) {
                $scope.error = true;
                $scope.errorMSG = result.error
            }

            $scope.projects.forEach(function(project) {
                if (!project.end_date_month) {
                    project.end_date_year = "On Going"
                    project.end_date_month = " "
                }
            })

        });
        $(".overlay").hide();
    }
    $rootScope.initProjects();

    $scope.setPage = function(pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function() {
        $scope.getArticles();
    };

    //get the next batch of users (pagination related)
    $scope.getArticles = function() {

        $http.get('/paginate/' + $scope.currentPage).success(function(response) {
            $scope.articles = response.articles;


        }).error(function(response) {
            $scope.error = response.message;
        });
    };

    //delete the desired article
    $scope.deleteProject = function(id) {
        $(".overlay").show();
        $http.post("/project/delete/" + id)
            .then(function(success) {
                // $state.reload();
                $rootScope.initProjects();
            })
    }

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

    //add article (publish it)
    $scope.addProject = function(valid) {
        // console.log($scope.contract_title + $scope.start_date + $scope.end_date + $scope.onGoing + $scope.description + $scope.client + $scope.consultant + $scope.referee)


        // $rootScope.Projects = $scope.article;
        // $rootScope.Projects.cover_photo = $scope.image.src;

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
                $http.post("/project/file_upload/",
                        formData, {
                            headers: {
                                'Content-Type': undefined
                            }
                        })
                    .then(function(success) {
                        $http.post("/project/add/", {
                                contract_title: $scope.contract_title,
                                start_date_month: $scope.start_month,
                                start_date_year: $scope.start_year,
                                end_date_year: $scope.end_year,
                                end_date_month: $scope.end_month,
                                description: $scope.description,
                                client: $scope.client,
                                consultant: $scope.consultant,
                                referee: $scope.referee,
                                cover_photo: x
                            })
                            .then(function(success) {
                                $scope.isSaving = false;
                                window.location.href = "projects_list";
                            })
                    })

            }

            else {
                $scope.isSaving = true;

                $http.post("/project/add/", {
                        contract_title: $scope.contract_title,
                        start_date_month: $scope.start_month,
                        start_date_year: $scope.start_year,
                        end_date_year: $scope.end_year,
                        end_date_month: $scope.end_month,
                        description: $scope.description,
                        client: $scope.client,
                        consultant: $scope.consultant,
                        referee: $scope.referee
                    })
                    .then(function(success) {
                        $scope.isSaving = false;
                        window.location.href = "projects_list";
                    })
            }
        }
    }


});
