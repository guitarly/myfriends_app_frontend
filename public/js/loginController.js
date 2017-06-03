(function() {
  'use strict';

  angular
    .module('Myfriends_App')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$http', '$scope', '$location', '$rootScope', '$window'];

  function LoginController($http, $scope, $location, $rootScope, $window) {

    // this.url = 'http://localhost:3000';
    this.url = 'https://meandfriends.herokuapp.com';
    // $rootScope.currentUser = {};
    var vm = this;


    // Login
    this.login = function() {

      vm.dataLoading = true;

      $http({
        method: 'POST',
        url: this.url + '/users/login',
        data: {
          user: {
            username: this.formLogin.username,
            password: this.formLogin.password
          }
        }
      }).then(function(response) {

        if (response.data.status == 401) {
          $rootScope.login_error_msg = response.data.message;
          vm.dataLoading = false;
        } else {
          $rootScope.currentUser = response.data.user;
          $rootScope.login_error_msg  = null;
          localStorage.setItem('token', JSON.stringify(response.data.token));
          $window.localStorage.setItem('user', JSON.stringify(response.data.user));

          $window.localStorage.setItem('friends', JSON.stringify(response.data.friends));

          $rootScope.friends = response.data.friends;
          // this.getGoogleMap();
          // $scope.mapController.getGoogleMap();
          // $rootScope.loggedIn = true;
          vm.dataLoading = false;
          $rootScope.retrieveGoogleMap = true;
          $location.path('/dashboard');
        };

      }.bind(this));

    }; // end login function


    // Logout
    this.logout = function() {
      console.log("Logout");
      localStorage.clear('token');
      $scope.error_msg = null;
      $window.localStorage.removeItem('user');
      $window.localStorage.removeItem('friends');
      location.reload();
      $location.path("/");
    }; // End logout function

    // create user...from register form
    // SENDS CREATE USER REQUEST TO BACKEND
    this.register = function() {
      $rootScope.errorMessage = null;
      vm.dataLoading = true;
      console.log("Register");

      $http({
        method: 'POST',
        url: this.url + '/users',
        data: this.registerFormData
      }).then(function(result) {

        if (result.data.error) {
          $rootScope.error_msg = result.data.error;
          vm.dataLoading = false;
        } else {
          vm.dataLoading = false;
          $location.path('/dashboard');
        };


      }.bind(this));

    }; // end register function

    this.dashboard = function() {
      $location.path('/dashboard');
    }; // end dashoard function


    // Edit user
    this.editUser = function(data) {
      let editFormData = data;
      let userId = $rootScope.currentUser.id;
      editFormData.id = userId;
        $http({
          method: 'PUT',
            url: this.url + '/users/' + userId,
            data: {
              user: editFormData
            }
          }).then(function(response) {

            $rootScope.currentUser = response.data.user;
            $rootScope.error_msg = null;
            $window.localStorage.setItem('user', JSON.stringify(response.data.user));

          }.bind(this));


    }; // End edit user

    //Delete user
    this.deleteUser = function(user) {
      console.log("Delete .. user");
      let userId = $rootScope.currentUser.id;
      $http({
        method: 'DELETE',
          url: this.url + '/users/' + userId
        }).then(function(response) {

          console.log("delete successful");
          this.logout();

        }.bind(this));


    }; // End Delete user function



    // Get all users
    this.getUsers = function() {

      $http({
        url: this.url + '/users',
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('token'))
        }
      }).then(function(response) {
        console.log(response);
        if (response.data.status == 401) {
          $rootScope.error = "Unauthorized";
        } else {
          this.users = response.data;
        }
      }.bind(this));

    }; // end getUsers function


  }; // end

})();
