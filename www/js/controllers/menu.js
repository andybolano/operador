(function () {
    'use strict';
    angular
            .module('app')
            .controller('MenuCtrl',['authService','$ionicLoading','$location','$state', MenuCtrl]);
    /* @ngInject */
    function MenuCtrl(authService, $ionicLoading,$location,$state) {
        var vm = this;
        vm.sitio = {};
        vm.logout = logout;
      vm.sitio = JSON.parse(localStorage.getItem('data'));
      vm.sitio.email = localStorage.getItem("email");
         vm.isActive = function(viewLocation){
                    return viewLocation === $location.path();
           }   
       function logout(){
                var promisePost = authService.logout();
                      promisePost.then(function (d) {
                          message("sesión finalizada!");
                          $state.go('login', {}, {reload: true});
                        },
                        function error(error) {
                           messge(error.data.error);
                        });
                }
         function message(msg) {
            $ionicLoading.show({template: msg, noBackdrop: true, duration: 2000});
        }
    }
})();






