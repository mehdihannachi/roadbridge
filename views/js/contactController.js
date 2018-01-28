roadbridge.directive('fileModel', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function() {
                scope.classcv = "ng-valid"
                scope.$apply(function() {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);




roadbridge.controller('contactController', function($scope, $http, $timeout) {

    $scope.alertsuccess = false;
    $scope.alertdanger = false;
    $scope.sendMessage = function(form) {
        $scope.submitted = true;


        if (form.$valid) {


            $scope.submitted = false;


            $http.post('/ajax/contact-us', {
                data: $scope.p

            }).then(function(response) {

                var data = response.data

                if (data.error == true) {
                    $scope.alertdanger = true;
                    $timeout(function() {

                        $scope.alertdanger = false;
                    }, 5000)
                }
                else if (data.error == false) {
                    $scope.alertsuccess = true;
                    $timeout(function() {

                        $scope.alertsuccess = false;
                    }, 5000)

                }
            });
        }
    }
})



roadbridge.controller('careersController', function($scope, $http, $timeout) {
    $scope.classcv = "ng-invalid"
    $scope.alertsuccess = false;
    $scope.alertdanger = false;
    $scope.sendMessage = function(form) {
        $scope.submitted = true;
        if (($scope.from) && (!$scope.from.cv)) {
            $scope.classcv = "ng-invalid"
        }

        if (form.$valid) {




            var fd = new FormData();
            Object.keys($scope.p).forEach(function(key) {
                fd.append(key, $scope.p[key]);
            });



            $scope.submitted = false;


            $http.post('/ajax/careers', fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }

            }).then(function(response) {

                var data = response.data
                console.log(response)

                if (data.error == true) {
                    $scope.alertdanger = true;
                    $timeout(function() {

                        $scope.alertdanger = false;
                    }, 5000)
                }
                else if (data.error == false) {
                    $scope.alertsuccess = true;
                    $timeout(function() {

                        $scope.alertsuccess = false;
                    }, 5000)

                }
            });
        }
    }
})

roadbridge.controller('projectController', function($scope, $resource, $sessionStorage, $rootScope, $window) {
    $scope.image = {};
    $rootScope.initProjects = function() {

        var ProjectsAll = $resource('/projects');
        ProjectsAll.get().$promise.then(function(result) {
            console.log(result)
            $scope.projects = result.projects
            $scope.rankedList = [];
            angular.forEach($scope.projects, function(item) {
                $scope.rankedList.push({
                    item: item,
                    rank: 0.5 - $window.Math.random()
                });
            });
            console.log($scope.rankedList)
            if (result.error) {
                $scope.error = true;
                $scope.errorMSG = result.error
            }
        });
    }
    $rootScope.initProjects();


    $scope.loadIndex = 9;
    // function to increase visible items
    $scope.showMore = function() {
        // don't increment if at the end of the list
        if ($scope.loadIndex < $scope.projects.length) {
            $scope.loadIndex += 9;
        }
    };

})

roadbridge.controller('projectDetailController', function($scope, $resource, $sessionStorage, $rootScope, $routeParams, $filter) {
    $scope.image = {};
    var url = window.location.pathname
    var projectId = url.split('/project/')[1];
    $rootScope.project

    $scope.imageSrc =
        $rootScope.initProject = function() {

            var Project = $resource('/project/show/' + projectId);
            Project.get().$promise.then(function(result) {
                console.log(result)
                $rootScope.project = result
                $scope.imageSrc = '/public/img/' + $rootScope.project.cover_photo;
                console.log($scope.imageSrc)
                if (!$rootScope.project.end_date_month) {
                    $rootScope.project.end_date_year = "On Going"
                    $rootScope.project.end_date_month = " "
                }
                if (result.error) {
                    $scope.error = true;
                    $scope.errorMSG = result.error
                }
            });
        }
    $rootScope.initProject();

    $scope.savePDF = function() {

        var tinymceToJSPDFHTML = document.createElement("body");
        var doc = new jsPDF();
        var margin = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
        };
        // We'll make our own renderer to skip this editor
        var specialElementHandlers = {
            '#editor': function(element, renderer) {
                return true;
            },
            '.controls': function(element, renderer) {
                return true;
            }
        };

        // All units are in the set measurement for the document
        // This can be changed to "pt" (points), "mm" (Default), "cm", "in"

        doc.fromHTML(tinymceToJSPDFHTML, 0, 0, {
            'width': 100, // max width of content on PDF
            'elementHandlers': specialElementHandlers
        }, function(bla) {
            doc.save('saveInCallback.pdf');
        }, margin);
        // var columns = [{
        //     title: "header",
        //     dataKey: "header"
        // }, {
        //     title: "content",
        //     dataKey: "content"
        // }];
        // var rows = [];

        // rows = [{
        //     "header": "Contract Title",
        //     "content": $rootScope.project.contract_title
        // }, {
        //     "header": "Start Date",
        //     "content": $filter('amDateFormat')($rootScope.project.start_date, 'MMMM YYYY')
        // }, {
        //     "header": "On going",
        //     "content": $rootScope.project.onGoing
        // }, {
        //     "header": "Description",
        //     "content": $rootScope.project.description.replace(/(<([^>]+)>)/ig, "")
        // }, {
        //     "header": "Client",
        //     "content": $rootScope.project.client
        // }, {
        //     "header": "Consultant",
        //     "content": $rootScope.project.consultant
        // }, {
        //     "header": "Referee",
        //     "content": $rootScope.project.referee
        // }];



        // // Only pt supported (not mm or in)
        // var doc = new jsPDF('landscape', 'pt');
        // doc.autoTable(columns, rows, {
        //     theme: 'grid',
        //     styles: {
        //         fillColor: [255, 255, 255],
        //         overflow: 'linebreak',
        //         fontSize: 11,
        //         textcolor: 0

        //     },
        //     columnStyles: {

        //         header: {
        //             columnWidth: 100,
        //             fillColor: 255

        //         },
        //         content: {
        //             columnWidth: 700,
        //             fillColor: 255,
        //             fontSize: 12

        //         }
        //     },
        //     pageBreak: 'auto', // 'auto', 'avoid' or 'always'
        //     tableWidth: 'auto', // 'auto', 'wrap' or a number,
        //     margin: {
        //         top: 60,
        //         horizontal: 20
        //     },
        //     addPageContent: function(data) {
        //         doc.text("Contract: " + $rootScope.project.contract_title, 40, 30);
        //     }
        // });
        // var file = doc.output('blob');
        // var fd = new FormData(); // To carry on your data  
        // fd.append('mypdf', file, "Contract: " + $rootScope.project.contract_title + '.pdf');

        // doc.save("Contract: " + $rootScope.project.contract_title + '.pdf');


    }
})
