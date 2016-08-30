var App = angular.module("App", ['ui.bootstrap', 'ui.router', 'ngMessages', 'toastr', 'satellizer', 'dirPagination']);

App.config(function ($stateProvider, $urlRouterProvider, $authProvider) {

    //Application states
    $stateProvider
      .state('home', {
          url: '/',
          views: {
              navModule: {
                  templateUrl: 'Scripts/App/partials/navbar.html',
                  controller: 'NavbarCtrl'
              },
              '': {
                  templateUrl: 'Scripts/App/partials/home.html',
                  controller: 'videoController'
              },
              footerModule: {
                  templateUrl: 'Scripts/App/partials/footer.html'
              }
          }
      })
      .state('videos', {
          url: '/videos',
          views: {
              navModule: {
                  templateUrl: 'Scripts/App/partials/navbar.html',
              },
              '': {
                  templateUrl: 'Scripts/App/partials/videos.html',
                  controller: 'allVideosController'
              },
              footerModule: {
                  templateUrl: 'Scripts/App/partials/footer.html'
              }
          }
      })
      .state('login', {
          url: '/login',
          views: {
              navModule: {
                  templateUrl: 'Scripts/App/partials/navbar.html',
              },
              '': {
                  templateUrl: 'Scripts/App/partials/login.html',
                  controller: 'LoginCtrl',
                  resolve: {
                      skipIfLoggedIn: skipIfLoggedIn
                  }
              },
              footerModule: {
                  templateUrl: 'Scripts/App/partials/footer.html'
              }
          }
      })
      .state('signup', {
          url: '/signup',
          views: {
              navModule: {
                  templateUrl: 'Scripts/App/partials/navbar.html',
              },
              '': {
                  templateUrl: 'Scripts/App/partials/signup.html',
                  controller: 'SignupCtrl',
                  resolve: {
                      skipIfLoggedIn: skipIfLoggedIn
                  }
              },
              footerModule: {
                  templateUrl: 'Scripts/App/partials/footer.html'
              }
          }
      })
      .state('logout', {
          url: '/logout',
          views: {
              navModule: {
                  templateUrl: 'Scripts/App/partials/navbar.html',
              },
              '': {
                  templateUrl: 'Scripts/App/partials/home.html',
                  controller: 'LogoutCtrl',
              },
              footerModule: {
                  templateUrl: 'Scripts/App/partials/footer.html'
              }
          }
      })
      .state('admin', {
          url: '/admin',
          views: {
              navModule: {
                  templateUrl: 'Scripts/App/partials/navbar.html',
              },
              '': {
                  templateUrl: 'Scripts/App/partials/admin.html',
                  controller: 'AdminCtrl',
                  resolve: {
                      adminRequired: adminRequired
                  }
              },
              footerModule: {
                  templateUrl: 'Scripts/App/partials/footer.html'
              }
          }
      })
      .state('profile', {
          url: '/profile',
          views: {
              navModule: {
                  templateUrl: 'Scripts/App/partials/navbar.html',
              },
              '': {
                  templateUrl: 'Scripts/App/partials/profile.html',
                  controller: 'ProfileCtrl',
                  resolve: {
                      loginRequired: loginRequired
                  }
              },
              footerModule: {
                  templateUrl: 'Scripts/App/partials/footer.html'
              }
          }
      });

    $urlRouterProvider.otherwise('/');


    //Satellizer configuration
    $authProvider.httpInterceptor = function () { return true; },
    $authProvider.withCredentials = true;
    $authProvider.tokenRoot = null;
    $authProvider.baseUrl = 'http://localhost:3000';
    $authProvider.loginUrl = '/auth/login';
    $authProvider.signupUrl = '/auth/signup';
    $authProvider.unlinkUrl = '/auth/unlink/';
    $authProvider.tokenName = 'token';
    $authProvider.tokenPrefix = 'ndcvideo';
    $authProvider.authHeader = 'Authorization';
    $authProvider.authToken = 'Bearer';
    $authProvider.storageType = 'localStorage';


    //Check if user is authenticated, 
    //and skip if user is logged in
    function skipIfLoggedIn($q, $auth) {
        var deferred = $q.defer();
        if ($auth.isAuthenticated()) {
            deferred.reject();
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    }

    //Check if user is not authenticated,
    //and send user to the login page if the user tries to access
    //a page that requires authentication
    function loginRequired($q, $location, $auth) {
        var deferred = $q.defer();
        if ($auth.isAuthenticated()) {
            deferred.resolve();
        } else {
            $location.path('/login');
        }
        return deferred.promise;
    }

    //Check if the user is admin,
    //if user is not admin and attempts to access the admin page
    //send user to the home state
    function adminRequired($q, $location, AdminService) {
        var deferred = $q.defer();

        AdminService.getAdmin().then(
            function (result) {
                if (result) {
                    deferred.resolve();
                } else {
                    $location.path('/home')
                }
            });
        return deferred.promise;
    }

});