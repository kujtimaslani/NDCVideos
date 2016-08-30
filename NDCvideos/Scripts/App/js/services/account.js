angular.module('App')
    .factory('Account', function ($http) {

        //Functions to get or send profile data
        return {
            getProfile: function () {
                return $http.get('http://localhost:3000/api/me');
            },
            updateProfile: function (profileData) {
                return $http.put('http://localhost:3000/api/me', profileData);
            }
        };
    });