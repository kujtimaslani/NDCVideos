angular.module("App").filter('sanitize', ['$sce', function ($sce) {

    //'Trust' all html code added from javascript so it can be disaplyed as html
    return function (htmlcode) {
        return $sce.trustAsHtml(htmlcode);
    }
}])
