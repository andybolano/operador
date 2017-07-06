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



