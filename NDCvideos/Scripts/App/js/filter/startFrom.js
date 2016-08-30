angular.module("App").filter('startFrom', function () {

    //Filter to decide where the ng-repeat will start from
    //Example: startFrom: 2 will start the ng-repeat from 2 and not 1
    return function (input, start) {
        if (input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});