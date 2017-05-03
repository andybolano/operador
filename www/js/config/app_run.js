 (function() {
        'use strict';

        angular.module('app').run(['$ionicPlatform','$state','authService','HOME','$ionicPopup',appRun]);    
        function appRun($ionicPlatform,$state,authService, HOME,$ionicPopup) {                       
            
            $ionicPlatform.ready(function () {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
                
                
  /* var push = PushNotification.init({
                android: {
                        senderID: "991363187494",
                        vibrate : true,
                        sound:true,
                        alert: true,
                        badge: true
                }
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
          });*/
          
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


