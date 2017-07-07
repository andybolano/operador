 (function() {
     'use strict';
     angular.module('app').run(['$ionicPlatform', '$state', 'authService', 'HOME', '$ionicPopup', appRun]);

     function appRun($ionicPlatform, $state, authService, HOME, $ionicPopup) {
         $ionicPlatform.ready(function() {
             if (window.cordova && window.cordova.plugins.Keyboard) {
                 cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                 cordova.plugins.Keyboard.disableScroll(true);
             }
             if (window.StatusBar) {
                 StatusBar.styleDefault();
             }
               var push = PushNotification.init({
                android: {
                        senderID: "991363187494",
                        vibrate : true,
                        sound:true,
                        alert: true,
                        badge: true
                },
                 
                ios: {
		alert: "true",
		badge: "true",
		sound: "true"
                },
            });
                     push.on('registration', function(data) {
                         window.localStorage.setItem('regId',data.registrationId);
                     });

             push.on('notification', function(data) {
                 var confirmPopup = $ionicPopup.confirm({
                title: 'Notificación',
                template: data.message,
                buttons: [
                    {text: 'Entendido',
                        type: 'button-positive',
                        onTap: function (e) {
                            
                        }
                    },
                ]
              });
          });

             autenticate();
         });

         function autenticate() {
             if (authService.currentUser() !== null) {
                 $state.go(HOME);
             } else {
                 $state.go('login');
             }
         }
     }
 })();
 (function() {
     'use strict';

     angular
         .module('app')
         .config(['$ionicConfigProvider', config]);

     /* @ngInject */
     function config($ionicConfigProvider) {
         $ionicConfigProvider.navBar.alignTitle('left');
     }
 })();
 (function() {
     'use strict';
     angular
         .module('app')
         .config(['$httpProvider', config])
        //.constant('API_URL', 'http://localhost/birrias/api/public/index.php/api');
         .constant('API_URL', 'https://birriassoccer.com/public/api');

     function config($httpProvider) {
         $httpProvider.interceptors.push('Request');
     }
 })();
 angular.module("app").factory("Request", function(sessionService) {
     var request = function request(config) {
         config.headers["Token"] = sessionService.getToken();
         config.headers["User"] = sessionService.getIdUser();
         return config;
     };
     return {
         request: request
     };
 });
 (function() {
     'use strict';
     angular
         .module('app')
         .config(['$stateProvider', config])
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