(function() {
  'use strict';

  angular
    .module('Myfriends_App')
    .controller('FriendController', FriendController);

  FriendController.$inject = ['$http', '$scope', '$location', '$rootScope', '$window'];

  function FriendController($http, $scope, $location, $rootScope, $window) {


    this.url = 'http://localhost:3000';
    var vm = this;
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
          this.getGoogleMap();
          // $rootScope.loggedIn = true;
          $location.path('/dashboard');
        };

      }.bind(this));


    }; // end submitEditFriend function


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


        marker.content = '<IMG BORDER="0" width="80" ALIGN="Left" SRC="' + info.image + '"> <br>' + '<div class="infoWindowContent" id="myCtrl" ng-app="Myfriends_App" ng-controller="FriendController as ctrl" >' + '<br />' + info.fulladdress + ' ,<br/>' + info.phone + '<br /><button onclick="sendText()" id="demo">send text</button>' + '  </div>';

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


    // this.init = function() {
    //   if ($rootScope.retrieveGoogleMap) {
    //     this.getGoogleMap();
    //     $rootScope.retrieveGoogleMap = !$rootScope.retrieveGoogleMap;
    //   };
    //
    // };
    //
    // this.init();

    $scope.sort = function(keyname) {
      $scope.sortKey = keyname; //set the sortKey to the param passed
      $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };


    this.showFriend = function(friend) {
      $rootScope.myFriend = friend;
    }; // end showFriend function


    // show address on the google map
    this.showAddress = function(e, marker) {

      e.preventDefault();
      google.maps.event.trigger(marker, 'click');
    }; // end showAddress function


  }; // end FriendController function



})();
