// loginController contoller 
roadbridge.controller('loginController', function($scope, $http, $sessionStorage, $state, $timeout) {

    $scope.connectedUser = {};
    $scope.loggedIn = function() {
        if ($sessionStorage.connectedUser) {
            $scope.connectedUser = $sessionStorage.connectedUser;
        }
    }
    $scope.loggedIn();
    $scope.userLogin = {};
    $scope.userSignup = {};
    $scope.PassReco = {};


    // function btn_login
    $scope.btn_login = function(valid) {
        $scope.submitted = true;
        if (valid) {

            $http.post('/ajax/login', {
                email: $scope.userLogin.email,
                password: $scope.userLogin.password
            }).then(function successCallback(response) {
                console.log(response)
                if (response.data.error == false) {
                    $sessionStorage.connectedUser = response.data.user;
                    window.location.href = '/projects_list';
                }
                else {
                    $scope.error = true;
                    $scope.errorMSG = response.error;
                    $timeout(function() {
                        $scope.error = false;
                    }, 4000);
                }

            }).then(function failureCallback(response) {
                console.log(response)
            })
        }

    }

    $scope.btn_signup = function(valid) {
        $scope.submitted = true;

        if (valid) {

            $http.post('/ajax/signup-admin', {
                user: $scope.userSignup,
                email: $scope.userSignup.email,
                password: $scope.userSignup.password,
                isAdmin: 'true'
            }).then(function successCallback(response) {
                if (!response.error) {

                    window.location.href = '/';
                }
                else {
                    if (response.error) {
                        $scope.error = true;
                        $scope.errorMSG = response.error;
                        $timeout(function() {
                            $scope.error = false;
                        }, 4000);
                    }
                    // console.error("Error sign up patient")
                }
            })

        }
        else {
            $scope.error = true;
            $scope.errorMSG = 'Veuillez verifier tout les champs et les termes du contrat'
            $timeout(function() {
                $scope.error = false;
            }, 4000);
        }
    }


    // passwordController
    $scope.btn_Forgotpassword = function(valid) {
        console.log("test")
        $scope.submitted = true;
        $scope.sendmail = false;
        $scope.error = false;
        $scope.errorMSG = "";
        if (valid) {
            $scope.submitted = false;
            $http.post('/ajax/forgotpassword', {
                email: $scope.forgetemail
            }).then(function successCallback(response) {
                if (!response.error) {
                    $scope.sendmail = true;
                    $scope.error = false;
                }
                else if (response.error == true) {
                    $scope.error = true
                    $scope.errorMSG = response.message
                    $timeout(function() {
                        $scope.error = false;
                    }, 4000);
                }
            }).then(function failureCallback(response) {
                $scope.showerrorcnx = true;
                $scope.errorcnx = response;
            });
        }

    }



    $scope.btn_logout = function() {
        console.log('jej')
        $http.get('/logout').then(function(response) {
                if (response.data.error == false) {
                    delete $sessionStorage.connectedUser;
                    window.location.href = '/';
                }
                else {
                    $scope.error = true;
                    $scope.errorMSG = response.data.error;
                    $timeout(function() {
                        $scope.error = false;
                    }, 4000);
                }

            }),
            function(res2) {};
    }

});
