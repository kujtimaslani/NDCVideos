angular.module('App')
    .filter('search', function () {

        //Filter videos
        return function (array, search) {
            var matches = [];
            for (var i = 0; i < array.length; i++) {
                if (array[i].indexOf(search) === 0 &&
                    search.length < array[i].length) {
                    matches.push(array[i]);
                }
            }
            return matches;
        };
    });