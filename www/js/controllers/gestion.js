(function () {
    'use strict';
    angular.module('gestion', [])
            .config(['$stateProvider',function ($stateProvider) {
                $stateProvider
                        .state('usuario.gestion', {
                            url: '/gestionReservas',
                            templateUrl: 'app/gestion/gestion.html',
                            controller: 'gestionCtrl as vm'
                        })
            }]);
})();
(function () {
    'use strict';

    angular
            .module('gestion')
            .controller('gestionCtrl',['$ionicLoading', '$scope', '$ionicModal', 'reservasService', 'sessionService', '$ionicTabsDelegate', '$ionicSlideBoxDelegate', '$ionicPopup','$state', GestionCtrl]);
    /* @ngInject */
    function GestionCtrl($ionicLoading, $scope, $ionicModal, reservasService, sessionService, $ionicTabsDelegate, $ionicSlideBoxDelegate, $ionicPopup,$state) {
        var vm = this;
        $scope.$on('$ionicView.loaded', function () {
            vm.getReservas = getReservas;
            vm.viewReserva = viewReserva;
            vm.closeModal = closeModal;
            vm.actualizarEstadoGestion = actualizarEstadoGestion;
            vm.moverReserva = moverReserva;
            vm.recordar = recordarReserva;
            vm.nuevasSolicitudes = [];
            vm.esperandoConfirmacion = [];
            vm.confirmadas = [];
            vm.v_reserva = {};
            vm.dinero = {};
            vm.fechaHoy = "";

            $scope.$on("$ionicView.beforeEnter", function (event, data) {
                getReservas();
            });

            $ionicModal.fromTemplateUrl('modalReserva.html', {
                scope: $scope,
                animation: 'zoom-from-center'
            }).then(function (modal) {
                $scope.modal = modal;
            });
            Date.prototype.toDateInputValue = (function () {
                var local = new Date(this);
                local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
                return local.toJSON().slice(0, 10);
            });
            vm.fechaHoy = new Date().toDateInputValue();

        });
    var push = PushNotification.init({
                android: {
                        senderID: "991363187494",
                        vibrate : true,
                        sound:true,
                        alert: true,
                        badge: true
                }
            });

         push.on('notification', function(data) {
                 var confirmPopup = $ionicPopup.confirm({
                title: 'Notificación',
                template: data.message,
                buttons: [
                    {text: 'Entendido',
                        type: 'button-positive',
                        onTap: function (e) {
                            getReservas();
                        }
                    },
                ]
              });
          });
        function moverReserva(){
             vm.closeModal();
                 vm.v_reserva.estadisticas = vm.v_estadisticas;
                 localStorage.setItem("reservaMover", JSON.stringify(vm.v_reserva));
                 $state.go("usuario.reservar");
        }
        function recordarReserva(idCliente, estado){
             var object = {
                 idCliente:idCliente,
                 estado:estado,
                 sitio:sessionService.getIdSitio()
             }

            var promisePost = reservasService.recordar(object);
                        promisePost.then(function (d) {
                            message(d.data.message);
                        }, function (err) {
                            if (err.status == 401) {
                                message(err.data.respuesta);
                            } else {
                                message("Ha ocurrido un problema al enviar la notificación!");
                            }
                        }); 
         }  
        function getReservas() {
            vm.nuevasSolicitudes = [];
            vm.esperandoConfirmacion = [];
            vm.confirmadas = [];
            $ionicLoading.show();
            var promisePost = reservasService.getBySitio(sessionService.getIdSitio());
            promisePost.then(function (d) {
                $ionicLoading.hide();
                if (d.data.length > 0) {
                    var i = 0;
                    for (i = 0; i < d.data.length; i++)
                    {

                        if (d.data[i].estado == 'esperandorevision') {
                            vm.nuevasSolicitudes.push(d.data[i]);
                        } else if (d.data[i].estado == "esperandoconfirmacion") {
                            vm.esperandoConfirmacion.push(d.data[i]);
                        } else if (d.data[i].estado == "confirmadaconabono" || d.data[i].estado == "confirmadasinabono") {
                            vm.confirmadas.push(d.data[i]);
                        }
                    }
                } else {
                    message("No hay reservas en proceso!");
                }
            }, function (err) {
                if (err.status == 401) {
                    message(err.data);
                } else {
                    message("Ha ocurrido un problema!");
                }
            }).finally(function () {
                $scope.$broadcast('scroll.refreshComplete');
            });
        }
        function viewReserva(reserva) {
            vm.v_reserva = reserva;
            $scope.modal.show();
            if (document.getElementById("pago") !== null) {
                document.getElementById("pago").value = parseInt(vm.v_reserva.precio - vm.v_reserva.abonoLiquidado);
            }
        }
        $scope.changetab = function (item) {
            $ionicTabsDelegate.select(item);
        };
        $scope.changeSlide = function (item) {
            $ionicTabsDelegate.select(item);
            $ionicSlideBoxDelegate.slide(item);
        };
        function message(msg) {
            $ionicLoading.show({template: msg, noBackdrop: true, duration: 2000});
        }
        function viewReserva(reserva) {
           if (document.getElementById("pago") !== null) {
                document.getElementById("pago").value = parseInt(vm.v_reserva.precio - vm.v_reserva.abonoLiquidado);
            }
            vm.v_reserva = reserva;
            $scope.modal.show();
        }
        function actualizarEstadoGestion(nuevoEstado, idReserva) {
            var object = "";
            var mensaje = "";
            switch (nuevoEstado)
            {
                case 1:
                    if (document.getElementById("valorReserva").value === "" ) {
                        message("Informale a tu cliente el valor de la cancha!");
                        return;
                    } 
                        nuevoEstado = "esperandoconfirmacion";
                        var precio = parseInt(document.getElementById("valorReserva").value.split('.').join(''));
                        var abonoRequerido = 0;
                        if (document.getElementById("abonoRequerido").value !== "") {
                             abonoRequerido = parseInt(document.getElementById("abonoRequerido").value.split('.').join(''));
                        }
                        object = {
                            estado: nuevoEstado,
                            idReserva: idReserva,
                            valor: precio,
                            abono: abonoRequerido
                        }
                        mensaje = "Se ha enviado la solicitud de confirmación a tu cliente";
                    break;
                case 2:
                    if (document.getElementById("masAbono").value === "") {
                        message("Debes registrar el abono!");
                        return;
                    }
                        nuevoEstado = "confirmadaconabono";
                        var abono = parseInt(document.getElementById("masAbono").value.split('.').join(''));
                        object = {
                            estado: nuevoEstado,
                            idReserva: idReserva,
                            valor: false,
                            abono: abono
                        }
                        mensaje = "Esta reserva ha sido confirmada y ha sido registrado su abono";
                    break;
                case 3:
                    nuevoEstado = "confirmadasinabono";
                    object = {
                        estado: nuevoEstado,
                        idReserva: idReserva,
                        valor: false,
                        abono: false
                    }
                    break;
                case 4:
                    nuevoEstado = "cancelada";
                    object = {
                        estado: nuevoEstado,
                        idReserva: idReserva,
                        valor: false,
                        abono: false,
                        emisor: 'SITIO',
                        detonador: 1
                    }
                    mensaje = "Su reserva ha sido cancelada";
                    break;

                case 5:
                    nuevoEstado = "cumplida";
                    
                    if (document.getElementById("pago").value === "" || document.getElementById("pago").value === 0) {
                        message("Ingrese el valor que se pagó");
                        return;
                    }
                    var pago = parseInt(document.getElementById("pago").value.split('.').join(''));
                    object = {
                        estado: nuevoEstado,
                        idReserva: idReserva,
                        valor: false,
                        abono: false,
                        pago: pago
                    }
                    mensaje = "La reserva ha sido cumplida";
                    break

                case 6:
                    nuevoEstado = "incumplida";
                    object = {
                        estado: nuevoEstado,
                        idReserva: idReserva,
                        valor: false,
                        abono: false
                    }
                    mensaje = "La reserva ha sido incumplida"
                    break
            }
            if (nuevoEstado === "cancelada") {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Cancelar reserva',
                    template: '<img src="img/pregunta.svg" width="30%"><br> Está seguro que desea cancelar esta reserva?',
                    buttons: [
                        {text: 'NO',
                            type: 'button-default',
                            onTap: function (e) {
                                message("Cancelacion abortada");
                            }
                        },
                        {
                            text: '<b>Si, cancelar</b>',
                            type: 'button-positive',
                            onTap: function (e) {
                                      $ionicLoading.show();
                                    var promisePost = reservasService.updateReservas(object);
                                    promisePost.then(function (d) {
                                        $ionicLoading.hide();
                                        if (d.data.respuesta == true) {
                                            vm.closeModal();
                                            document.getElementsByTagName('body')[0].classList.remove("modal-open");
                                            mostrarAlert("Buen Trabajo!", mensaje);
                                            vm.getReservas();
                                        }
                                    }, function (err) {
                                        $ionicLoading.hide();
                                        if (err.status == 401) {
                                            mostrarAlert('Oops', err.data.respuesta);
                                        } else {
                                            mostrarAlert("Oops...", "Ha ocurrido un problema!");
                                        }
                                    });
                            }
                        }
                    ]
                });
            } else {
                     $ionicLoading.show();
                    var promisePost = reservasService.updateReservas(object);
                    promisePost.then(function (d) {
                        $ionicLoading.hide();
                        if (d.data.respuesta == true) {
                            vm.closeModal();
                            document.getElementsByTagName('body')[0].classList.remove("modal-open");
                            mostrarAlert("Buen Trabajo!", mensaje);
                            vm.getReservas();
                        }
                    }, function (err) {
                        $ionicLoading.hide();
                        if (err.status == 401) {
                            mostrarAlert('Oops', err.data.respuesta);
                        } else {
                            mostrarAlert("Oops...", "Ha ocurrido un problema!");
                        }
                    });
            }
        }
        
        function mostrarAlert(titulo, contenido) {
            var alertPopup = $ionicPopup.alert({
                title: titulo,
                template: contenido
            });
            alertPopup.then(function (res) {
            });
        }
        function closeModal() {
            $scope.modal.hide();
        }
        ;
    }
})();

