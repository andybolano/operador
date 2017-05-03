(function() {
    'use strict';

    angular
        .module('app')
        .config(['$ionicConfigProvider',config]);

    /* @ngInject */
    function config($ionicConfigProvider) {
        $ionicConfigProvider.navBar.alignTitle('left');
    }
    
    
})();



   
    



