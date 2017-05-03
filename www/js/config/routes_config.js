(function() {
    'use strict';

    angular
        .module('app')
        .config(['$stateProvider',config])
        .constant('HOME', 'usuario.home')      
   
    /* @ngInject */
    function config($stateProvider) {
       $stateProvider
            .state('usuario', {
                url: '/usuario',
                abstract: true,
                templateUrl: 'app/layout/layout.html'
            })
    }
})();

