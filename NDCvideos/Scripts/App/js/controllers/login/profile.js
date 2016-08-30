angular.module('App')
    .controller('ProfileCtrl', function ($scope, toastr, Account) {

        //GET - get profile data from logged in user
        $scope.getProfile = function () {
            Account.getProfile()
                .then(function (response) {
                    $scope.user = response.data;
                    console.log(response.data);
                })
                .catch(function (response) {
                    toastr.error(response.data.message, 'Error');
                });
        };

        //POST - update the user with the new profile data
        $scope.updateProfile = function () {
            Account.updateProfile($scope.user)
                .then(function () {
                    toastr.success('Profile has been updated');
                })
                .catch(function (response) {
                    toastr.error(response.data.message, 'Error');
                });
        };

        $scope.getProfile();
  });
