(function() {
  'use strict';

  // const app = angular.module('Myfriends_App', ['ngRoute', 'ngCookies']);
  angular
    .module('Myfriends_App', ['ngRoute', 'ngCookies'])
    .config(config)
    .run(run);



  // ROUTES CONFIGURATION
  // app.config(function($routeProvider) {
  config.$inject = ['$routeProvider', '$locationProvider'];

  function config($routeProvider, $locationProvidere) {

    $routeProvider
      .when('/', {
        controller: 'LoginController',
        templateUrl: '/views/landing-page.html',
        controllerAs: 'vm'
      })
      .when('/register', {
        controller: 'LoginController',
        templateUrl: '/views/register.html',
        controllerAs: 'vm'
        //Added a meals config
      })
      .when('/login', {
        controller: 'LoginController',
        templateUrl: '/views/login.html',
        reloadOnSearch: false,
        controllerAs: 'vm'
      })
      .when('/dashboard', {
        // resolve: {
        //   "check": function($location, $rootScope) {
        //     if (!$rootScope.loggedIn) {
        //       $location.path('/');
        //     }
        //   }
        // },
        templateUrl: '/views/dashboard.html',
        controller: 'LoginController',
        // controller: 'FriendController',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/'
      });

  }; // end function

  run.$inject = ['$rootScope', '$location', '$cookies', '$http', '$window'];

  function run($rootScope, $location, $cookies, $http, $window) {
    // keep user logged in after page refresh
    $rootScope.globals = $cookies.getObject('globals') || {};

    if ($rootScope.globals.currentUser) {
      $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
    }

    $rootScope.$on('$locationChangeStart', function(event, next, current) {
      // redirect to login page if not logged in and trying to access a restricted page

      let restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;

      var storageUser = $window.localStorage.getItem('user');
      if (storageUser) {
        try {
          $rootScope.currentUser = JSON.parse(storageUser);
        } catch (e) {
          $window.localStorage.removeItem('user');
        }
      }
      var storageFriends = $window.localStorage.getItem('friends');
      if (storageFriends) {
        try {
          $rootScope.friends = JSON.parse(storageFriends);
        } catch (e) {
          $window.localStorage.removeItem('friends');
        }
      }

      if (typeof $rootScope.retrieveGoogleMap == "undefined") {
        console.log("$rootScope.retrieveGoogleMap == underfined");
        $rootScope.retrieveGoogleMap = true;
      }

      let loggedIn = $rootScope.globals.currentUser;
      if (restrictedPage && !loggedIn && !storageUser) {
        $location.path('/');
      }
    });
  }; // end run function



})();
