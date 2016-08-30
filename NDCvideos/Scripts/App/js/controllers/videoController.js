angular.module("App")
    .controller('videoController', ['$scope', '$http', '$auth', function ($scope, $http, $auth) {

        //Checks if user is authenticated or not
        $scope.isAuthenticated = function () {
            return $auth.isAuthenticated();
        };

        //GET - get the 8 latest videos from the server
        $scope.latestVideos = [];
        $http.get('http://localhost:3000/api/videos')
            .success(function (data) {
                for (i = 0; i < 8; i++) {
                    $scope.latestIframe = data[i].iframe;
                    $scope.title = data[i].title;
                    $scope.createIframe = "<iframe src='https://player.vimeo.com/video/" + $scope.latestIframe
                                            + "?badge=0&autopause=1' title='" + $scope.title
                                            + "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
                    $scope.latestVideos.push({
                        iframe: $scope.createIframe
                    });
                }
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });

        //GET - get the 8 most viewed videos from the server
        $scope.mostViewsData = [];
        $http.get('http://localhost:3000/api/mostviewed')
            .success(function (data) {
                for (j = 0; j < 8; j++) {
                    $scope.mostViewedIframe = data[j].iframe;
                    $scope.title = data[j].title;
                    $scope.createIframe = "<iframe src='https://player.vimeo.com/video/" + $scope.mostViewedIframe
                                            + "?badge=0&autopause=1' title='" + $scope.title + "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
                    $scope.mostViewsData.push({
                        iframe: $scope.createIframe
                    });
                }
                console.log($scope.mostViewsData);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
}]);
