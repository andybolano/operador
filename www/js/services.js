(function () {
    'use strict';

    angular
            .module('auth')
            .service('authService',['$http','$q','$ionicHistory','$ionicLoading','$timeout','API_URL',authService]);
    /* @ngInject */
    function authService($http,$q,$ionicHistory,$ionicLoading,$timeout,API_URL) {
        var service = {
            login: login,
            currentUser: currentUser,
            logout: logout,
            autologin: autologin,
            registro:registro
        };
        return service;

        function login(user) {
           var defered = $q.defer();
            var promise = defered.promise;
             var timeoutPromise = $timeout(function ()
                      {
                          canceler.resolve();
                          $ionicLoading.hide();
                          message("Tiempo de respuesta agotado, verifique su conexion");
                      },10000);
                      var canceler = $q.defer();
            $http.post(API_URL+'/authenticate',user,{timeout: canceler.promise}).then(success, error);
            return promise;

            function success(p) {
               $timeout.cancel(timeoutPromise);
              defered.resolve(p);
              if(p.data.respuesta === true){
                    storeUser(p.data);
                }
            }
            function error(error) {
                $timeout.cancel(timeoutPromise);
                destroyCredenciales();
                defered.reject(error);
            }
        } ;
        
     
        
        function registro(object){
            var defered = $q.defer();
            var promise = defered.promise;
        var timeoutPromise = $timeout(function ()
                      {
                          canceler.resolve();
                          $ionicLoading.hide();
                          message("Tiempo de respuesta agotado, verifique su conexion");
                      },10000);
                      var canceler = $q.defer();
            $http.post(API_URL+'/administrador',object,{timeout: canceler.promise}).then(success, error);
            return promise;

            function success(p) {
                 $timeout.cancel(timeoutPromise);
              defered.resolve(p);
            }
            function error(error) {
                 $timeout.cancel(timeoutPromise);
                defered.reject(error);
            }
        };
      


        function storeUser(data) {
            var data = JSON.parse("[" + data.user + "]");
             window.localStorage.setItem('data',JSON.stringify(data[0].sitio));
             window.localStorage.setItem('sitioId',data[0].sitio.id);
             window.localStorage.setItem('userId',data[0].id);
             window.localStorage.setItem('email',data[0].email);
             window.localStorage.setItem('rol',data[0].rol);
             window.localStorage.setItem('token',data[0].token);
             window.localStorage.setItem('userIsLogin',true);
        };
        function currentUser() {            
            return JSON.parse(window.localStorage.getItem('data'));
        }
        

        function autologin() {
            var defered = $q.defer();
            var promise = defered.promise;
            var usuario = currentUser();
            if (usuario) {
                defered.resolve(usuario);
            } else {
                defered.resolve(false);
            }
            return promise;
        }
        
        function logout(){ 
            var defered = $q.defer();
            var promise = defered.promise;
            var reg_id = localStorage.getItem('regId');
              destroyCredenciales();
                setTimeout(function () {
                    $ionicHistory.clearCache();
                    $ionicHistory.clearHistory();
                    $ionicHistory.nextViewOptions({disableBack: true, historyRoot: true});
                    $ionicLoading.hide();
                }, 30);
                defered.resolve();
                
            localStorage.setItem('regId',reg_id);
          
            $http.post(API_URL+'/logout').then(success, error);
            return promise;
             function success(p) {

            }
            function error(error) {
                defered.reject(error);
            }
        };
            
            
       
       
        function destroyCredenciales() {
            localStorage.clear();
            sessionStorage.clear();
        }
        
         function message(msg) {
            $ionicLoading.show({template: msg, noBackdrop: true, duration: 2000});
        }
    }



})();



(function () {
    'use strict';

    angular
        .module('app')
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


(function () {
    'use strict';

    angular
        .module('app')
        .service('clienteService', ['$http','$q', 'API_URL', '$ionicLoading','$timeout',clienteService]);

    /* @ngInject */
    function clienteService($http,$q, API_URL, $ionicLoading,$timeout) {

        var service = {
            get: get,
            getByPhone:getByPhone
        
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
            $http.get(API_URL+'/cliente/'+id).then(success, error);
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
          function getByPhone(phone){
            var defered = $q.defer();
            var promise = defered.promise;
            $http.get(API_URL+'/cliente/'+phone+'/telefono').then(success, error);
            return promise;
             function success(p) {
                defered.resolve(p);
            }
            function error(error) {
                defered.reject(error)
            }
        }
    }
})();




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





(function () {
    'use strict';

    angular
        .module('app')
        .service('sessionService', sessionService);

    /* @ngInject */
    function sessionService() {

        var service = {
            isLoggedIn: isLoggedIn,
            getIdUser: getIdUser,
            getIdSitio: getIdSitio,
            getToken : getToken,
            getRol:getRol
            
        };
        return service;

      
        function isLoggedIn(){
          return localStorage.getItem('userIsLogin') !== null;  
        };
        
         function getToken(){
          if(localStorage.getItem('token') !== null){
              return localStorage.getItem('token');
          } 
        };
         function getRol(){
          if(localStorage.getItem('rol') !== null){
              return localStorage.getItem('rol');
          } 
        };
        function getIdUser(){
            if(localStorage.getItem('userId') !== null){
              return localStorage.getItem('userId');
          } 
          
        }
        function getIdSitio(){
         if(localStorage.getItem('sitioId') !== null){
              return localStorage.getItem('sitioId');
          } 
        }
    }
})();



