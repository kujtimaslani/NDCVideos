angular.module('App')
    .controller('LoginCtrl', function ($scope, $location, $auth, toastr) {

        //sends the form data to satellizer's login function
        //if the data is correct, you will be sent a success message
        //if the data doesn't correspond with data from the database, you will be sent an error message.
        $scope.login = function () {
            $auth.login($scope.user)
                .then(function () {
                    toastr.success('You have successfully signed in!');
                    $location.path('/');
                })
                .catch(function (error) {
                    toastr.error(error.data.message, 'Error', {
                        preventOpenDuplicates: false
                    });
                });
        };
    });
