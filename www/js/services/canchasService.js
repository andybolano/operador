(function () {
    'use strict';

    angular
        .module('cancha')
        .service('canchaService',['$http','$q', 'API_URL', '$ionicLoading','$timeout', canchaService]);

    /* @ngInject */
    function canchaService($http,$q, API_URL, $ionicLoading,$timeout) {
        var service = {
            get: get
        };
        return service;

        function get(id){
           var defered = $q.defer();
            var promise = defered.promise;
              var timeoutPromise = $timeout(function ()
                      {
                          canceler.resolve();
                          $ionicLoading.hide();
                          message("Conexión lenta, intente nuevamente");
                      },10000);
                      var canceler = $q.defer();
            $http.get(API_URL+'/canchas/'+id+'/sitio').then(success, error);
            return promise;
             function success(p) {
                  $timeout.cancel(timeoutPromise);
                defered.resolve(p);
            }
            function error(error) {
                defered.reject(error);
                 $timeout.cancel(timeoutPromise);
            }
        };
    }
})();

