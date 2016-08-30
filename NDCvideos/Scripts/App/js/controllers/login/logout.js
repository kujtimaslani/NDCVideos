angular.module('App')
    .controller('LogoutCtrl', function ($state, $auth, toastr) {

        //Checks if user is authenticated and then logs him out
        if (!$auth.isAuthenticated()) { return; }
        $auth.logout()
            .then(function () {
                toastr.info('You have been logged out');
                $state.go('home');
            });
    });