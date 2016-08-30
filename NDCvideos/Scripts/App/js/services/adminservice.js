angular.module('App')
  .factory('AdminService', function ($q, $http, toastr) {
      
      //Functions to get if the current user is admin or not
      return {
          getAdmin: function () {
              var httpget = $http.get('http://localhost:3000/api/isadmin');

              return httpget.then(function (response) {
                  var res = response.data.role;
                  if (res == 'admin') {
                      return true;
                  }
                  else {
                      return false;
                  }
              }, function (result) {
                  return false;
              });
          }
      };
  });
