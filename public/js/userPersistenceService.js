(function() {
  'use strict';

  angular
    .module('Myfriends_App')
    .factory('userPersistenceService', userPersistenceService);

  userPersistenceService.$inject = ["$cookies"];

  function userPersistenceService($cookies) {
    let userName = "";

    return {
      setCookieData: function(username) {
        userName = username;
        $cookies.put("userName", username);
      },
      getCookieData: function() {
        userName = $cookies.get("userName");
        return userName;
      },
      clearCookieData: function() {
        userName = "";
        $cookies.remove("userName");
      }
    };


  }; // end userPersistenceService function


})();
