angular.module("App")
    .controller('allVideosController', ['$scope', '$http', function ($scope, $http) {

        var totalNum;
        $scope.allVideoData = [];
        $scope.itemsPerPage = 12;
        $scope.currentPage = 1;

        //Filter buttons
        $scope.buttons = ['.NET', 'Agile', 'C++', 'Cloud', 'Database', 'Embedded', 'Java', 'JavaScript', 'Microsoft', 'Mobile', 'People', 'Scrum', 'Security', 'Web'];

        $scope.$watch('q', function (newValue, oldValue) {
        });

        //GET - get videos from the server and display them when page is accessed
        $scope.videoData = [];
        $http.get('http://localhost:3000/api/videos')
            .success(function (data) {
                for (i = 0; i < data.length; i++) {
                    $scope.iframehtml = data[i].iframe;
                    $scope.title = data[i].title;
                    $scope.createIframe = "<iframe src='https://player.vimeo.com/video/" + $scope.iframehtml
                                            + "?badge=0&autopause=1' title='" + $scope.title
                                            + "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
                    $scope.videoData.push({
                        iframe: $scope.createIframe,
                        title: $scope.title
                    });
                }
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
}]);
