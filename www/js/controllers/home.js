(function () {
    'use strict';
    angular.module('home', [])
            .config(['$stateProvider',function ($stateProvider) {
                $stateProvider
                        .state('usuario.home', {
                            url: '/home',
                            cache: false,
                            templateUrl: 'app/home/home.html',
                            controller: 'homeCtrl as vm'
                        })
                        .state('usuario.detalleHoy', {
                            url: '/home/detalle',
                            cache: false,
                            templateUrl: 'app/home/detalle.html',
                            controller: 'homeCtrl as vm'
                        })
            }]);
})();
(function () {
    'use strict';

    angular
            .module('home')
            .controller('homeCtrl',['$ionicLoading','$scope','reservasService','canchaService','sessionService','$ionicModal','$ionicPopup', HomeCtrl]);
    /* @ngInject */
    function HomeCtrl($ionicLoading,$scope,reservasService,canchaService,sessionService,$ionicModal,$ionicPopup) {
        var vm = this;
        $scope.$on('$ionicView.loaded', function () {
            vm.getReservasHoy = getReservasHoy;
            vm.viewReserva = viewReserva;
            vm.closeModal = closeModal;
            vm.actualizarEstado = actualizarEstado;
            vm.recordarReserva = recordarReserva;
            descargarCanchas();
            vm.finanzas = {};
            vm.estadisticasReservas = {};
            vm.v_reserva = {};
            vm.reservas = [];
            $scope.time = "";
            $scope.hora = "";
            vm.network = true;
            Date.prototype.toDateInputValue = (function () {
                var local = new Date(this);
                local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
                return local.toJSON().slice(0, 10);
            });
            $ionicModal.fromTemplateUrl('modalReservaHome.html', {
                scope: $scope,
                animation: 'zoom-from-center'
            }).then(function (modal) {
                $scope.modal = modal;
            });
        });
        $scope.$on("$ionicView.beforeEnter", function (event, data) {
            getReservasHoy();
        });
        
        function descargarCanchas(){
              if (window.localStorage.getItem('canchas') == null) {
                var promisePost = canchaService.get(sessionService.getIdSitio());
                promisePost.then(function (d) {
                    if (d.data.canchas.length == 0) {
                        message("No hay canchas registradas");
                    } else {
                        window.localStorage.setItem('precios', JSON.stringify(d.data.precios));
                        window.localStorage.setItem('canchas', JSON.stringify(d.data.canchas));
                        vm.Canchas = d.data.canchas;
                    }
                }, function (err) {
                    if (err.status == 401) {
                        message(err.data.respuesta);
                    } else {
                        message("Ha ocurrido un problema!");
                    }
                });
            }
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
        function actualizarEstado(estado,idReserva){
             var object = "";
             var mensaje = "";
             var nuevoEstado = "";
                    switch (estado)
                    {
                        case 1:
                            nuevoEstado = "cumplida";
                            var pago = parseInt(document.getElementById("pago").value.split('.').join(''));
                            if (document.getElementById("pago").value === "" || document.getElementById("pago").value === 0) {
                                message("Ingrese el valor que se pagó");
                                return false;
                            }
                            object = {
                                estado: nuevoEstado,
                                idReserva: idReserva,
                                valor: false,
                                abono: false,
                                pago: pago
                            }
                            mensaje = "La reserva ha sido cumplida";
                            break;
                        case 0:
                            nuevoEstado = "incumplida";
                            object = {
                                estado: nuevoEstado,
                                idReserva: idReserva,
                                valor: false,
                                abono: false
                            }
                            mensaje = "La reserva ha sido incumplida";
                            break;
                    }
              var confirmPopup = $ionicPopup.confirm({
                title: 'Cambiar Estado',
                template: '<img src="img/pregunta.svg" width="30%"><br> Está seguro que desea cambiar el estado de reserva a: <b>' + nuevoEstado+"</b>",
                buttons: [
                    {text: 'Cancelar',
                        type: 'button-default',
                        onTap: function (e) {
                            message("Movimiento cancelado");
                        }
                    },
                    {
                        text: '<b>Si</b>',
                        type: 'button-positive',
                        onTap: function (e) {
                              $ionicLoading.show();
                            reservasService.updateReservas(object).then(success, error);
                            function success(d) {
                                $ionicLoading.hide();
                                 if (d.data.respuesta === true) {
                                    vm.closeModal();
                                      document.getElementsByTagName('body')[0].classList.remove("modal-open");
                                    mostrarAlert("Buen Trabajo!", mensaje, "success");
                                    vm.getReservasHoy();
                                }
                            }
                            function error(error) {
                                $ionicLoading.hide();
                                if (error.status == 401) {
                                     mostrarAlert('Oops', error.data.respuesta, "error");
                                    return;
                                } else {
                                    mostrarAlert("Oops...", "Ha ocurrido un problema!", "error");
                                    return
                                }
                            }
                        }
                    }
                ]
            });        
        }
        function hora() {
            var f = new Date();
            var hor = f.getHours();
            var min = f.getMinutes();
            var sec = f.getSeconds();
            if (hor < 10) {hor = 0 + String(hor);}
            if (min < 10) {min = 0 + String(min);}
            if (sec < 10) {sec = 0 + String(sec);}
            $scope.$apply(function () {
                $scope.time = hor + ":" + min + ":" + sec;
                $scope.hora = parseInt(hor);
            });
        }
        function viewReserva(reserva) {
            vm.v_reserva = reserva;
            $scope.modal.show();
        }
        function closeModal() {
            $scope.modal.hide();
        };
        function getEstadisticas() {
            // Create the data table.
            vm.estadisticasReservas.incumplidas = 0;
            vm.estadisticasReservas.canceladas = 0;
            vm.estadisticasReservas.cumplidas = 0;
            vm.estadisticasReservas.espera = 0;
            var fecha = new Date().toDateInputValue();
            var promisePost = reservasService.getEstadisticasByFecha(sessionService.getIdSitio(), fecha, fecha);
            promisePost.then(function (d) {
                var i = 0;
                for (i = 0; i < d.data.reservas.length; i++) {
                    if (d.data.reservas[i].estado === 'confirmadasinabono' || d.data.reservas[i].estado === 'confirmadaconabono') {
                        vm.estadisticasReservas.espera += parseInt(d.data.reservas[i].cantidad);
                    }
                    if (d.data.reservas[i].estado === 'cumplida') {
                        vm.estadisticasReservas.cumplidas = parseInt(d.data.reservas[i].cantidad);
                    }
                    if (d.data.reservas[i].estado === 'incumplida') {
                        vm.estadisticasReservas.incumplidas = parseInt(d.data.reservas[i].cantidad);
                    }
                    if (d.data.reservas[i].estado === 'cancelada') {
                        vm.estadisticasReservas.canceladas = parseInt(d.data.reservas[i].cantidad);
                    }
                }
            }, function (err) {
                if (err.status == 401) {
                   message(err.data.respuesta);
                } else {
                    message("Ha ocurrido un problema!");
                }
            });
        }
        function getReservasHoy() {
            setInterval(hora, 1000);
            var fecha = new Date().toDateInputValue();
            $ionicLoading.show();
            var promisePost = reservasService.getByFechaAll(sessionService.getIdSitio(), fecha);
            promisePost.then(function (d) {
                getEstadisticas();
                $ionicLoading.hide();
                vm.finanzas.expectativa = parseInt(d.data.finanzas.posibleEntrada);
                vm.finanzas.realidad = parseInt(d.data.finanzas.dineroEntrante);
                vm.finanzas.abonos = parseInt(d.data.finanzas.abonos);
                if (d.data.length === 0) {
                    message("No hay reservas : " + fecha);
                    vm.reservas = d.data.reservas;
                    vm.finanzas.expectativa = 0;
                    vm.finanzas.realidad = 0;
                } else {
                    vm.reservas = d.data.reservas;
                }
            }, function (err) {
                if (err.status == 401) {
                    message("Iniciar sesión");
                } else {
                    message("Conexión lenta, intente nuevamente");
                }
            }).finally(function () {
                $scope.$broadcast('scroll.refreshComplete');
            });
        }
        function message(msg) {
            $ionicLoading.show({template: msg, noBackdrop: true, duration: 2000});
        }
        function mostrarAlert(titulo, contenido) {
            var alertPopup = $ionicPopup.alert({
                title: titulo,
                template: contenido
            });
            alertPopup.then(function (res) {
            });
        }
    }
})();



