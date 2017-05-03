(function() {
    'use strict';
    angular
        .module('app')
        .config(['$httpProvider',config])
.constant('API_URL', 'http://localhost/birrias/api/public/index.php/api');
//.constant('API_URL', 'https://birriassoccer.com/public/api');
            function config($httpProvider){  
             $httpProvider.interceptors.push('Request');
            }
})();

 angular.module("app").factory("Request", function(sessionService)
{
      var request = function request(config)
      {
          config.headers["Token"] = sessionService.getToken();
          config.headers["Sitio"] = sessionService.getIdUser();
          return config;
      };
      return {
          request: request
      };
});
  