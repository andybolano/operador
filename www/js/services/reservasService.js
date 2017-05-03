(function () {
    'use strict';

    angular
        .module('reservar')
        .service('reservasService',['$http','$q', 'API_URL','$timeout','$ionicLoading', reservasService]);

    /* @ngInject */
    function reservasService($http,$q, API_URL,$timeout,$ionicLoading) {

        var service = {
            post: post,
            getByFecha:getByFecha,
            getBySitio:getBySitio,
            updateReservas:updateReservas,
            getByFechaAll:getByFechaAll,
            getEstadisticasByFecha: getEstadisticasByFecha,
            getHistorial:getHistorial,
            actualizarFecha:actualizarFecha,
            recordar:recordar
            
        };
        return service;
        
        function recordar(object){
           var defered = $q.defer();
            var promise = defered.promise;
            $http.post(API_URL+'/reserva/recordar', object).then(success, error);
            return promise;
             function success(p) {
                defered.resolve(p);
            }
            function error(error) {
                defered.reject(error)
            }
       }
       
       //para actualizar fecha y hora
       function actualizarFecha(object){
           var defered = $q.defer();
            var promise = defered.promise;
            $http.put(API_URL+'/reservas/fecha/'+object.idReserva, object).then(success, error);
            return promise;
             function success(p) {
                defered.resolve(p);
            }
            function error(error) {
                defered.reject(error)
            }
       }
       
       //para actualizar estado y abono
        function updateReservas(object){
           var defered = $q.defer();
            var promise = defered.promise;
            $http.put(API_URL+'/reservas/'+object.idReserva, object).then(success, error);
            return promise;
             function success(p) {
                defered.resolve(p);
            }
            function error(error) {
                defered.reject(error)
            }
        }
        
        function post(object){
           
           var defered = $q.defer();
            var promise = defered.promise;
            $http.post(API_URL+'/reservas', object).then(success, error);
            return promise;
             function success(p) {
                defered.resolve(p);
            }
            function error(error) {
                defered.reject(error);
            }
        };
        
        
     
        function getByFecha(id,fecha){
            var defered = $q.defer();
            var promise = defered.promise;
            $http.get(API_URL+'/reservas/sitio/'+id+'/fecha/'+fecha).then(success, error);
            return promise;
             function success(p) {
                defered.resolve(p);
            }
            function error(error) {
                defered.reject(error)
            }
        };
        
        function getByFechaAll(id,fecha){
           var defered = $q.defer();
            var promise = defered.promise;
            var timeoutPromise = $timeout(function ()
                      {
                          canceler.resolve();
                          $ionicLoading.hide();
                          message("Conexión lenta, intente nuevamente");
                      },10000);
                      var canceler = $q.defer();
                      
            $http.get(API_URL+'/reservas/sitio/'+id+'/fecha/'+fecha+'/all',{timeout: canceler.promise}).then(success, error);
            return promise;
             function success(p) {
                $timeout.cancel(timeoutPromise);
                defered.resolve(p);
            }
            function error(error) {
                  $timeout.cancel(timeoutPromise);
                defered.reject(error);
            } 
        }
        
        function getBySitio(id){
            var defered = $q.defer();
            var promise = defered.promise;
            $http.get(API_URL+'/reservas/sitio/'+id).then(success, error);
            return promise;
             function success(p) {
                defered.resolve(p);
            }
            function error(error) {
                defered.reject(error)
            }
        }
        
        function getEstadisticasByFecha(id,fecha1,fecha2)
        {
            
            var defered = $q.defer();
            var promise = defered.promise;
            $http.get(API_URL+'/reservas/sitio/'+id+'/fecha/'+fecha1+'/'+fecha2+'/estado').then(success, error);
            return promise;
             function success(p) {
                defered.resolve(p);
            }
            function error(error) {
                defered.reject(error)
            }
            
        }
        
        function getHistorial(id,fecha1,fecha2){
             var defered = $q.defer();
            var promise = defered.promise;
             var timeoutPromise = $timeout(function ()
                      {
                          canceler.resolve();
                          $ionicLoading.hide();
                          message("Conexión lenta, intente nuevamente");
                      },10000);
                      var canceler = $q.defer();
            $http.get(API_URL+'/reservas/sitio/'+id+'/fecha/'+fecha1+'/'+fecha2+'/historial',{timeout: canceler.promise}).then(success, error);
            return promise;
             function success(p) {
                  $timeout.cancel(timeoutPromise);
                defered.resolve(p);
            }
            function error(error) {
                 $timeout.cancel(timeoutPromise);
                defered.reject(error)
            }
        }
        
        function message(msg) {
            $ionicLoading.show({template: msg, noBackdrop: true, duration: 2000});
        }
    }
})();




