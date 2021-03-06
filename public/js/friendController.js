(function() {
  'use strict';

    angular.module('Myfriends_App')
    .controller('FriendController', FriendController);


  FriendController.$inject = ['$http', '$scope', '$location', '$rootScope', '$window'];

  function FriendController($http, $scope, $location, $rootScope, $window) {


    // this.url = 'http://localhost:3000';

    this.url = 'https://meandfriends.herokuapp.com';
    var vm = this;

    $scope.currentPage = 1
    $scope.itemsPerPage = 8
    $scope.totalItems = $rootScope.friends.length;

    $scope.setPage = function (pageNo) {
      $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function() {
      console.log('Page changed to: ' + $scope.currentPage);
    };

    $scope.reloadRoute = function() {
       $window.location.reload();
    };


    this.submitNewFriend = function() {
      let userId = $rootScope.currentUser.id;
      // this.frienddata.user_id = userId;

      $http({
        method: 'POST',
        url: this.url + '/users/' + userId + '/friends',
        data: {
          friend: this.frienddata,
          userID: userId
        }

      }).then(function(response) {
        if (response.data.status == 401) {
          $rootScope.error_msg = "Error - Friend can't be save";
          vm.dataLoading = false;
        } else {

          $rootScope.friends = response.data;
          $window.localStorage.setItem('friends', JSON.stringify(response.data));

          vm.dataLoading = false;
          $scope.totalItems = $rootScope.friends.length;
          $scope.reloadRoute();
          this.getGoogleMap();
          // $rootScope.loggedIn = true;
          $location.path('/dashboard');
        };

      }.bind(this));

    }; // end submitNewFriend function

    // Edit Friend info
    this.submitEditFriend = function() {
      console.log("Edit friend");
      console.log($rootScope.myFriend);
      var userId = $rootScope.currentUser.id;
      var friendId = $rootScope.myFriend.id;

      // remove the marker
      for (var i = 0; i < $rootScope.friends.length; i++) {
        $rootScope.friends[i].marker = "";
      }

      // /users/: user_id / friends /: id

      $http({
        method: 'PUT',
        url: this.url + '/users/' + userId + '/friends/' + friendId,
        data: {
          friend: $rootScope.myFriend,
          userId: userId
        }

      }).then(function(response) {
        if (response.data.status == 401) {
          $rootScope.error_msg = "Error - Friend can't be save";
          vm.dataLoading = false;
        } else {
          console.log("save friend ok", response.data);
          $rootScope.friends = null;

          $window.localStorage.removeItem('friends');
          $rootScope.friends = response.data;
          $window.localStorage.setItem('friends', JSON.stringify(response.data));

          vm.dataLoading = false;
          $scope.reloadRoute();
          this.getGoogleMap();
          // $rootScope.loggedIn = true;
          $location.path('/dashboard');
        };

      }.bind(this));


    }; // end submitEditFriend function


    // Delete Friend
    this.deleteFriend = function(friendId) {

      console.log("confirmtoDelete", friendId);
      vm.dataLoading = true;
      var userId = $rootScope.currentUser.id;
      $http({
        method: 'DELETE',
        url: this.url + '/users/' + userId + '/friends/' + friendId,
        data: {
          friendId: friendId,
          userId: userId
        }
      }).then(function(response) {
        // retrieve all friends belongs to the user
        var userId = $rootScope.currentUser.id;
        $http({
          method: 'GET',
          url: this.url + '/users/' + userId + '/friends'
        }).then(function(response) {
          if (response.data.status == 401) {
            $rootScope.error_msg = "Error - can't retrieve friends";
            vm.dataLoading = false;
          } else {
            $window.localStorage.removeItem('friends');
            $rootScope.friends = response.data;
            $window.localStorage.setItem('friends', JSON.stringify(response.data));

            vm.dataLoading = false;
            $scope.totalItems = $rootScope.friends.length;
            $scope.reloadRoute();
            this.getGoogleMap();
            // $rootScope.loggedIn = true;
            $location.path('/dashboard');
          };

        }.bind(this));
      }.bind(this));


    }; // End deleteFriend function


    // GET Maps for all Friends' Address
    this.getGoogleMap = function() {
      var mapOptions = {};
      $scope.map = null;

      mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(37.56, -92),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

      $scope.markers = [];
      var infoWindow = new google.maps.InfoWindow();

      var createMarker = function(info, i) {

        var marker = new google.maps.Marker({
          map: $scope.map,
          position: new google.maps.LatLng(info.latitude, info.longitude),
          title: info.name
        });


        marker.content = '<IMG BORDER="0" width="80" ALIGN="Left" SRC="' + info.image + '"> <br>' + '<div class="infoWindowContent" id="myCtrl" ng-app="Myfriends_App" ng-controller="FriendController as ctrl" >' + '<br />' + info.fulladdress + ' ,<br/>' + info.phone + '<br />' + '  </div>';

        // marker.content = '<IMG BORDER="0" width="80" ALIGN="Left" SRC="' + info.image + '"> <br>' + '<div ng-app="Myfriends_App" ng-controller="FriendController as vm"><h2>' + marker.title + '</h2><input type="button" value="get" ng-click="vm.clickMe(' + info.name + ')"/>' + '<div class="infoWindowContent">' + info.fulladdress + '</div><div class="infoWindowContent">' + info.phone + '</div></div>';

        google.maps.event.addListener(marker, 'click', function() {
          infoWindow.setContent('<h2>' + marker.title + '</h2>' +
            marker.content);
          infoWindow.open($scope.map, marker);
        });

        // console.log(marker);
        $scope.markers.push(marker);
        $rootScope.friends[i].marker = marker;
      };

      var friends = null;
      var storageFriends = $window.localStorage.getItem('friends');
      if (storageFriends) {
        try {
          $rootScope.friends = JSON.parse(storageFriends);
        } catch (e) {
          $window.localStorage.removeItem('friends');
        }
      }
      friends = $rootScope.friends;

      for (let i = 0; i < $rootScope.friends.length; i++) {

        createMarker($rootScope.friends[i], i);
      };

      $scope.openInfoWindow = function(e, selectedMarker) {
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
      }

    }; // end getGoogleMap function

    // Send Email
    this.sendEmail = function(friend) {
      console.log(friend);
      console.log("Send email");
      friend.marker = null;
      friend.sender = "batcan75@gmail.com";
      // friend.sender = $rootScope.currentUser.email;

      $http({
        method: 'POST',
        url: this.url + '/sendEmail',
        data: {
          friend: friend
        }
      }).then(function(response) {
        console.log("Done sent.....email");

      }.bind(this));


    } // end sendEmail function

    // Send Text
    this.sendText = function(friend) {
      console.log("sendtext");
      friend.marker = null;

      $http({
        method: 'POST',
        url: this.url + '/sendText',
        data: {
          friend: friend
        }

      }).then(function(response) {
        console.log("Done sent.....text");

      }.bind(this));

    }; // end sendtext function

    $scope.sort = function(keyname) {
      $scope.sortKey = keyname; //set the sortKey to the param passed
      $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };


    this.setFriend = function(friend) {
      $rootScope.myFriend = null;
      $rootScope.myFriend = friend;
    }; // end setFriend function


    // show address on the google map
    this.showAddress = function(e, marker) {

      e.preventDefault();
      google.maps.event.trigger(marker, 'click');
    }; // end showAddress function


  }; // end FriendController function



})();
