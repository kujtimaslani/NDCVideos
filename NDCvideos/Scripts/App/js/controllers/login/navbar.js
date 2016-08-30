angular.module('App')
    .controller('NavbarCtrl', function ($q, $scope, $auth, AdminService) {

        //Checks if user is authenticated or not
        $scope.isAuthenticated = function () {
            return $auth.isAuthenticated();
        };

        //Checks if user is admin or not
        AdminService.getAdmin().then(
            function (result) {
            $scope.isAdmin = result;
            });
  });
