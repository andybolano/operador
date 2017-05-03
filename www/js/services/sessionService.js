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
        function getIdUser(){
           if(localStorage.getItem('data') !== null){
                var data = JSON.parse(localStorage.getItem('data'));
                return data.idUsuario;
           } 
          
        }
        function getIdSitio(){
         if(localStorage.getItem('sitioId') !== null){
              return localStorage.getItem('sitioId');
          } 
        }
    }
})();



