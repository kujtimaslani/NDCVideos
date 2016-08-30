angular.module('App')
  .controller('AdminCtrl', function ($scope, $http) {

      $scope.formData = {};


      //GET - Get Access code data from the server
      $http.get('http://localhost:3000/api/accesscode')
            .success(function (data) {
                $scope.accesscode = data;
            })
            .error(function (data) {
            });

      //POST - send and add the access code data to the server
      $scope.addAccessCode = function () {
          $http.post('http://localhost:3000/api/accesscode', $scope.formData)
            .success(function (data) {
                $scope.formData = {};
                $scope.accesscode = data;
            })
            .error(function (data) {
            });
      };

      //DELETE - delete the access code data from the server
      $scope.deleteAccessCode = function (id) {
          $http.delete('http://localhost:3000/api/accesscode/' + id)
            .success(function (data) {
                $scope.accesscode = data;
            })
            .error(function (data) {
            });
      };
  });
