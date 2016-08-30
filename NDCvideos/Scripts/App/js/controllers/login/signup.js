angular.module('App')
    .controller('SignupCtrl', function ($scope, $location, $auth, toastr) {

        //Sends form data to server to check if the user exists or not
        //If the user exists, show error message
        //If the user doesn't exist, add user to database and send user to login screen
        $scope.signup = function () {
            $auth.signup($scope.user)
                .then(function (response) {
                    $auth.setToken(response.token);
                    $location.path('/login');
                    toastr.info('You have successfully created a new account, proceed to sign in');
                })
                .catch(function (response) {
                    toastr.error(response.data.message, 'Error');
                });
        };
    });