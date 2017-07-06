(function () {
    'use strict';
    angular.module('auth', [])
        .config(['$stateProvider',function ($stateProvider) {
            $stateProvider
                .state('login', {
                    url: '/login',
                    cache: false,
                    templateUrl: 'app/auth/auth.html',
                    controller: 'AuthCtrl as vm',
                    data: {
                        noRequiresLogin: true
                    }
                })
        }]);
})();

(function () {
    'use strict';
    angular
            .module('auth')
            .controller('AuthCtrl',['authService','$state','HOME','$ionicLoading','$ionicHistory',AuthCtrl]);

    /* @ngInject */

    function AuthCtrl(authService, $state, HOME, $ionicLoading, $ionicHistory) {
        var vm = this;
        vm.usuario = {};
        vm.logo = false;
        vm.iniciarSesion = iniciarSesion;
        vm.hideLogo = hideLogo;
        vm.showLogo = showLogo;
        function hideLogo() {
            vm.logo = true;
        }
        function showLogo() {
            vm.logo = false;
        }
        function iniciarSesion() {
            if (vm.usuario.user === undefined || vm.usuario.user === "") {
                message("Ingresar Usuario");
                return 0;
            }
            if (vm.usuario.clave === undefined || vm.usuario.clave === "") {
                message("Ingresar Contraseña");
                return 0;
            }
            ;
            $ionicLoading.show();
            var object = {
                email: vm.usuario.user,
                password: vm.usuario.clave,
                regId: localStorage.getItem('regId')
            };
            

            authService.login(object).then(success, error);
            function success(d) {
                if (d.data.respuesta === true) {
                    $ionicLoading.hide();
                    $ionicHistory.clearHistory();
                    $ionicHistory.nextViewOptions({disableBack: true, historyRoot: true});
                    $state.go(HOME);
                } else {
                    $ionicLoading.hide();
                    message(d.data.message);
                    return false;
                }
            }
            function error(error) {
                $ionicLoading.hide();
                message("Tiempo de respuesta agotado, verifique su conexion");
            }
        }
        function message(msg) {
            $ionicLoading.show({template: msg, noBackdrop: true, duration: 2000});
        }
    }
})();






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


(function () {
    'use strict';
    angular.module('historial', [])
            .config(['$stateProvider',function ($stateProvider) {
                $stateProvider
                        .state('usuario.historial', {
                            url: '/historial',
                            templateUrl: 'app/historial/historial.html',
                            controller: 'historialCtrl as vm'
                        })
            }]);
})();
(function () {
    'use strict';

    angular
            .module('historial')
            .controller('historialCtrl',['$ionicLoading', '$scope', '$ionicModal', 'reservasService', 'sessionService' ,HistorialCtrl]);
    /* @ngInject */
    function HistorialCtrl($ionicLoading, $scope, $ionicModal, reservasService, sessionService) {
        var vm = this;
        vm.finanzas = {};
        vm.estadisticasReservas = {};
        vm.fecha1 = new Date();
        vm.fecha2 = new Date();
        vm.getReservas = getReservas;
        vm.openModal = openModal;
        vm.closeModal = closeModal;
        vm.closeModalReserva = closeModalReserva;
        vm.viewReserva = viewReserva;
        vm.v_reserva = {};
        vm.v_estadisticas = {};
        
        $ionicModal.fromTemplateUrl('modalReservas.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });

        $ionicModal.fromTemplateUrl('reserva.html', {
            scope: $scope,
            animation: 'zoom-from-center'
        }).then(function (modal) {
            $scope.modalReserva = modal;
        });


        function openModal() {
            $scope.modal.show();
        };


        function closeModal() {
            $scope.modal.hide();
        };
        function closeModalReserva() {
            $scope.modalReserva.hide();
        };
        Date.prototype.toDateInputValue = (function () {
            var local = new Date(this);
            local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
            return local.toJSON().slice(0, 10);
        });

        function drawChart() {
            // Create the data table.
            vm.estadisticasReservas.incumplidas = 0;
            vm.estadisticasReservas.canceladas = 0;
            vm.estadisticasReservas.cumplidas = 0;
            vm.estadisticasReservas.espera = 0;
            var promisePost = reservasService.getEstadisticasByFecha(sessionService.getIdSitio(), vm.fecha1.toDateInputValue(), vm.fecha2.toDateInputValue());
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

        function getReservas() {
            $ionicLoading.show();
            var promisePost = reservasService.getHistorial(sessionService.getIdSitio(), vm.fecha1.toDateInputValue(), vm.fecha2.toDateInputValue());
            promisePost.then(function (d) {
                vm.reservas = d.data.reservas;
                $ionicLoading.hide();
                drawChart();
                vm.finanzas.expectativa = parseInt(d.data.finanzas.posibleEntrada);
                vm.finanzas.realidad = parseInt(d.data.finanzas.dineroEntrante);
                vm.finanzas.abonos = parseInt(d.data.finanzas.abonos);

            }, function (err) {
                if (err.status == 401) {
                    message(err.data.respuesta);
                } else {
                    message("Conexión lenta, intente nuevamente");
                }
            });
        }

        getReservas();

        function message(msg) {
            $ionicLoading.show({template: msg, noBackdrop: true, duration: 2000});
        }

        function viewReserva(reserva) {
            vm.v_reserva = reserva;
            $scope.modalReserva.show();
          
        }

    }
})();


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







(function () {
    'use strict';
    angular.module('reservar', [])
            .config(['$stateProvider',function ($stateProvider) {
                $stateProvider
                        .state('usuario.reservar', {
                            url: '/reservar',
                            templateUrl: 'app/reservar/reservar.html',
                            controller: 'reservarCtrl as vm'
                        })
            }]);
})();
(function () {
    'use strict';
    angular
            .module('reservar')
            .controller('reservarCtrl',['$ionicLoading','$scope','$ionicModal','$ionicPopup','reservasService','clienteService','$ionicSlideBoxDelegate','$ionicTabsDelegate','sessionService',ReservarCtrl]);
    /* @ngInject */
    function ReservarCtrl($ionicLoading,$scope,$ionicModal,$ionicPopup,reservasService,clienteService,$ionicSlideBoxDelegate,$ionicTabsDelegate,sessionService) {
        var vm = this;
        $scope.$on("$ionicView.beforeEnter", function (event, data) {
              vm.horas = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
               if (window.localStorage.getItem('reservaMover') !== null) {
                      vm.reservaMover.existe = true;
                       moverReserva();
               }
        });
        $scope.$on('$ionicView.loaded', function () {
            vm.viewReserva = viewReserva;
            vm.getCanchas = getCanchas;
            vm.moveToFecha = moveToFecha;
            vm.comprobarReservada = comprobarReservada;
            vm.getAgendaDiaByCancha = getAgendaDiaByCancha;
            vm.cargarReserva = cargarReserva;
            vm.showReservasCargadas = showReservasCargadas;
            vm.closeModal = closeModal;
            vm.viewReserva = viewReserva;
            vm.closeModalReserva = closeModalReserva;
            vm.getCliente = getCliente;
            vm.reservar = reservar;
            vm.limpiarReservas = limpiarReservas;
            vm.cancelarActualizacion = cancelarActualizacion;
            vm.actualizarReserva = actualizarReserva;

            vm.dias = new Array('', 'Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado');
            vm.fecha = new Date();
            vm.diaSemana = "";
            vm.Fecha_r = "";
            vm.v_reserva = {};
            vm.v_cliente = {};
            vm.Cliente = {};
            vm.Cliente.existe = false;
            vm.Cancha = {};
            vm.Canchas = [];
            vm.reservadas = [];
            vm.RESERVA = [];
           vm.reservaMover ={};
            vm.reservaMover.existe = false;
            diaSemana();
            $ionicModal.fromTemplateUrl('modalReservaCargadas.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $ionicModal.fromTemplateUrl('modalReserva.html', {
                scope: $scope,
                animation: 'zoom-from-center'
            }).then(function (modal) {
                $scope.modalReserva = modal;
            });
            getCanchas();
            
        });
        $scope.changetab = function (item) {
            $ionicTabsDelegate.select(item);
        };
        $scope.changeSlide = function (item) {
            $ionicTabsDelegate.select(item);
            $ionicSlideBoxDelegate.slide(item);
        };
        Date.prototype.toDateInputValue = (function () {
            var local = new Date(this);
            local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
            return local.toJSON().slice(0, 10);
        });
        function diaSemana() {
            var dia = dia_semana(vm.fecha.toDateInputValue());
            vm.diaSemana = vm.dias[dia];
        }
        function cancelarActualizacion(){
            $ionicLoading.show();
            localStorage.removeItem('reservaMover');
            vm.reservaMover.existe = false;
            vm.RESERVA = [];
            vm.Cliente = {};
            vm.Cliente.existe = false;
            vm.closeModal();
              vm.horas = [];
            setTimeout(function(){
              vm.horas = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
              $scope.changeSlide(1);
              $scope.changeSlide(0);
              $ionicLoading.hide();
          },500);
        }
        function actualizarReserva() {
            if (document.getElementById('precio' + 0).value === "" || document.getElementById('abonoRequerido' + 0).value === "") {
                message("No se ha ingresado el valor de la reserva o el abono requedo o abono liquidado?");
                return false;
            }

            var object =
                    {
                        precio: parseInt(document.getElementById('precio' + 0).value.split('.').join('')),
                        abonoRequerido: parseInt(document.getElementById('abonoRequerido' + 0).value.split('.').join('')),
                        fecha: vm.RESERVA[0].fecha,
                        hora: vm.RESERVA[0].hora,
                        usuario:localStorage.getItem('email'),
                        diaSemana: vm.RESERVA[0].diaSemana,
                        cancha: vm.RESERVA[0].idcancha,
                        idReserva: vm.RESERVA[0].id
                    }
                    
            $ionicLoading.show();

            var promisePost = reservasService.actualizarFecha(object);
            promisePost.then(function (d) {
                $ionicLoading.hide();

                if (d.data.respuesta === true) {
                    localStorage.removeItem('reservaMover');
                    vm.reservaMover.existe = false;
                    mostrarAlert("Buen trabajo!", d.data.message);
                    vm.RESERVA = [];
                    vm.Cliente = {};
                    vm.Cliente.existe = false;
                    vm.closeModal();
                   document.getElementsByTagName('body')[0].classList.remove("modal-open");
                    getAgendaDiaByCancha();
                } else {
                    message(d.data.message);
                }
            }, function (err) {
                 $ionicLoading.hide();
                if (err.status == 401) {
                    message(err.data.respuesta);
                } else {
                    message("Ha ocurrido un problema!");
                }
            });

        }
        function limpiarReservas(){
        $ionicLoading.show();
        vm.closeModal();
        vm.RESERVA = [];
        vm.Cliente = {};
        vm.Cliente.existe = false;
        vm.horas = [];
        setTimeout(function(){
              vm.horas = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
              $scope.changeSlide(1);
              $scope.changeSlide(0);
              $ionicLoading.hide();
          },500);
        }
        function moveToFecha(direction) {
            var f1 = new Date(vm.fecha);
            var fecha = "";
            if (direction === '+') {
                fecha = new Date(f1.getTime() + 24 * 60 * 60 * 1000);
            }
            if (direction === '-') {
                fecha = new Date(f1.getTime() - 24 * 60 * 60 * 1000);
            }
            vm.fecha = new Date(fecha);
            getAgendaDiaByCancha();
        }
        function comprobarReservada(hora, cancha) {
            var i = 0;
            var sapo = false;
            for (i = 0; i < vm.reservadas.length; i++) {
                if (parseInt(vm.reservadas[i].hora) === hora && vm.reservadas[i].idCancha === cancha) {
                    sapo = true;
                    break;
                } else {
                    sapo = false;
                }
            }
            return sapo;
        }
        function cargarReserva(hora, cancha) {
            var fecha = document.getElementById("fechaReserva").value;
            var nombreCancha = "";
            var precio = 0;
            var token = false;
            var dia = dia_semana(vm.fecha.toDateInputValue());
            var diaSemana = vm.dias[dia];
            var f = new Date();
            var hoy = f.getFullYear() + "-" + (f.getMonth() + 1) + "-" + f.getDate();
            var resultado = dateComapreTo(hoy, document.getElementById("fechaReserva").value);
            var valid_hora = hora - f.getHours();
            if (resultado > 0) {
                message("Imposible devolver el tiempo");
                var idCheck = "check_" + cancha + "_" + hora + "_" + fecha;
                document.getElementById(idCheck).checked = false;
                return false;
            }
            if (valid_hora < 0 && resultado >= 0) {
                message("Imposible devolver el tiempo");
                var idCheck = "check_" + cancha + "_" + hora + "_" + fecha;
                document.getElementById(idCheck).checked = false;
                return false;
            }
            if (localStorage.getItem('reservaMover') !== null) {
             
                    vm.RESERVA[0].idcancha = cancha;
                    vm.RESERVA[0].hora = hora;
                    vm.RESERVA[0].fecha = fecha;
                    var data_canchas = JSON.parse(localStorage.getItem('canchas'));
                    var i = 0;
                    for (i = 0; i < data_canchas.length; i++)
                    {
                        if (parseInt(cancha) === parseInt(data_canchas[i].id))
                        {
                            vm.RESERVA[0].nombreCancha = data_canchas[i].nombre;
                        }
                    }
                    vm.RESERVA[0].diaSemana = diaSemana;
               
            } else {
                if (vm.RESERVA.length > 0) {
                    var i = 0;
                    for (i = 0; i < vm.RESERVA.length; i++) {
                        if (vm.RESERVA[i].idcancha === cancha && vm.RESERVA[i].hora === hora && vm.RESERVA[i].fecha === fecha)
                        {
                            vm.RESERVA.splice(i, 1);
                            token = true;
                        }
                    }
                }
                if (token === false) {
                    var data_canchas = JSON.parse(localStorage.getItem('canchas'));
                    var data_precio = JSON.parse(localStorage.getItem('precios'));
                    var i = 0;
                    for (i = 0; i < data_canchas.length; i++)
                    {
                        if (parseInt(cancha) === parseInt(data_canchas[i].id))
                        {
                            nombreCancha = data_canchas[i].nombre;

                            if (parseInt(data_precio[i].cancha) === parseInt(cancha)) {
                                var y = 0;
                                var precios = data_precio[i].precios;
                                for (y = 0; y < precios.length; y++) {
                                    if (precios[y].HORA === hora + ':00') {
                                        diaSemana = diaSemana.replace(/á/gi, "a");
                                        var dia = diaSemana.toUpperCase();
                                        var msgList = precios[y];
                                        var msgsKeys = Object.keys(msgList);
                                        for (var i = 0; i < msgsKeys.length; i++)
                                        {
                                            if (msgsKeys[i] === dia) {
                                                var msgType = msgsKeys[i];
                                                var msgContent = precios[y][msgType];
                                                msgContent = msgContent.toString() + ".";
                                                precio = parseInt(msgContent.split('.').join(''));
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    var reserva = {"idcancha": cancha, "nombreCancha": nombreCancha, "fecha": fecha, "diaSemana": diaSemana, "hora": hora, "precio": parseInt(precio)};
                    vm.RESERVA.push(reserva);
                }
            }
        }
        function showReservasCargadas() {
            $scope.modal.show();
        }
        function getCliente() {
            if (vm.Cliente.telefono !== undefined && vm.Cliente.telefono !== "") {
                var promisePost = clienteService.getByPhone(vm.Cliente.telefono);
                promisePost.then(function (d) {
                    if (d.data.respuesta === false) {
                        vm.Cliente.nombres = "";
                        vm.Cliente.existe = false;
                        return false;
                    }
                    if (d.data.respuesta === true) {
                        vm.Cliente.nombres = d.data.cliente.nombres;
                        vm.Cliente.apellidos = d.data.cliente.apellidos;
                        vm.Cliente.image = d.data.cliente.image;
                        vm.Cliente.url = d.data.cliente.url;
                        vm.Cliente.cumplidas = d.data.cliente.cumplidas;
                        vm.Cliente.incumplidas = d.data.cliente.incumplidas;
                        vm.Cliente.canceladas = d.data.cliente.canceladas;
                        vm.Cliente.resenia = d.data.cliente.resenia;
                        vm.Cliente.telefono = parseInt(d.data.cliente.telefono);
                        vm.Cliente.existe = true;
                    }
                }, function (err) {
                    if (err.status === 401) {
                        message(err.data.respuesta);
                    } else {
                        message("Ha ocurrido un problema!");
                    }
                });
            }
        }
        function closeModal() {
            $scope.modal.hide();
        };
        function getAgendaDiaByCancha() {
         diaSemana();
        // vm.horas = [];
            //para cuando estoy reservando en varios dias checkear los dias donde me muevo
            $ionicLoading.show();
            vm.Fecha_r = vm.fecha.toDateInputValue();
            var promisePost = reservasService.getByFecha(sessionService.getIdSitio(), vm.Fecha_r);
            promisePost.then(function (d) {
                $ionicLoading.hide();
                if (d.data.length === 0) {
                    vm.reservadas = [];
                    // vm.horas = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
                    message("No hay reservas : " + vm.Fecha_r);
                } else {
                    vm.reservadas = d.data;
                   // vm.horas = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
                }
                setTimeout(function () {
                    if (vm.RESERVA.length > 0 && window.localStorage.getItem('reservaMover') == null) {
                        var i = 0;
                        for (i = 0; i < vm.RESERVA.length; i++) {
                            if (vm.RESERVA[i].fecha === vm.fecha.toDateInputValue()) {
                                var idCheck = "check_" + vm.RESERVA[i].idcancha + "_" + vm.RESERVA[i].hora + "_" + vm.RESERVA[i].fecha;
                                document.getElementById(idCheck).checked = true;
                            }
                        }
                    }
                }, 500);
                
               
            }, function (err) {
                $ionicLoading.hide();
                if (err.status == 401) {
                    message(err.data.respuesta);
                } else {
                    message("Ha ocurrido un problema!");
                }
            });
        }
        function reservar() {
            var token = false;
            var item = "";
            var detalle = [];

            if (vm.Cliente.nombres === undefined || vm.Cliente.telefono === undefined) {
                message("Aun faltan datos del cliente?");
            } else {
                var tipo = "SIMPLE";

                if (vm.RESERVA.length > 1) {
                    tipo = "COMPUESTA";
                }
                var i = 0;
                for (i = 0; i < vm.RESERVA.length; i++) {
                    if (document.getElementById('precio' + i).value === "" || document.getElementById('abonoRequerido' + i).value === "") {
                        message("No se ha ingresado el valor de la reserva o el abono requedo o abono liquidado?");
                        token = false;
                        return false;
                    } else {
                        token = true;
                    }
                }
                if (token === true) {
                    for (i = 0; i < vm.RESERVA.length; i++) {


                        item = {
                            precio: parseInt(document.getElementById('precio' + i).value.split('.').join('')),
                            abonoRequerido: parseInt(document.getElementById('abonoRequerido' + i).value.split('.').join('')),
                            estado: 'confirmadasinabono'
                        };
                        detalle.push(item);
                    }
                    var reserva = {
                        nombre: vm.Cliente.nombre,
                        resenia:vm.Cliente.resenia,
                        telefono: vm.Cliente.telefono.toString(),
                        reserva: vm.RESERVA,
                        sitio: sessionService.getIdSitio(),
                        usuario:localStorage.getItem('email'),
                        via: 'LOCAL',
                        tipo: tipo,
                        detalle: detalle
                    };
                    $ionicLoading.show();

                    var promisePost = reservasService.post(reserva);
                    promisePost.then(function (d) {
                        $ionicLoading.hide();
                        if (d.data.respuesta === true) {
                            
                            mostrarAlert("Buen trabajo!", d.data.message);
                            vm.closeModal();
                            document.getElementsByTagName('body')[0].classList.remove("modal-open");
                            vm.RESERVA = [];
                            vm.Cliente = {};
                            reserva = {};
                            detalle = [];
                            vm.Cliente.existe = false;
                            getAgendaDiaByCancha();
                        } else {
                            message(d.data.message);
                        }
                    }, function (err) {
                        $ionicLoading.hide();
                        if (err.status == 401) {
                            message(err.data.respuesta);
                        } else {
                            message("Ha ocurrido un problema!");
                        }
                    });
                }
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
        function viewReserva(hora, cancha) {
            var i = 0;
            var y = 0;
            vm.v_reserva = {};
            for (i = 0; i < vm.reservadas.length; i++) {
                if (parseInt(vm.reservadas[i].hora) === parseInt(hora) && parseInt(vm.reservadas[i].idCancha) === parseInt(cancha)) {
                    var canchas = JSON.parse(localStorage.getItem('canchas'));
                    for (y = 0; y < canchas.length; y++) {
                        if (canchas[y].id === vm.reservadas[i].idCancha) {
                            var cancha = canchas[y].nombre;
                            break;
                        }
                    }
                    vm.v_reserva = vm.reservadas[i];
                    vm.v_reserva.nombrecancha = cancha;
                        $ionicLoading.show();
                    var promisePost = clienteService.get(vm.reservadas[i].idCliente);
                    promisePost.then(function (d) {
                        vm.v_cliente = d.data.cliente;
                            $ionicLoading.hide();
                     $scope.modalReserva.show();
                    }, function (err) {
                        if (err.status == 401) {
                            message(err.data.respuesta);
                        } else {
                            message("Ha ocurrido un problema!");
                        }
                    });
                    break;
                }
            }
            ;
        }
        function  closeModalReserva() {
            $scope.modalReserva.hide();
        } 
        Date.prototype.toDateInputValue = (function () {
            var local = new Date(this);
            local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
            return local.toJSON().slice(0, 10);
        });
        function getCanchas() {
                vm.Canchas = JSON.parse(window.localStorage.getItem('canchas'));
                setTimeout(function () {
                    $scope.changeSlide(1);
                    $scope.changeSlide(0);
                }, 100);
                setTimeout(function () {
                    getAgendaDiaByCancha();
                },200);
            
        }
          function moverReserva() {
            var reserva = JSON.parse(localStorage.getItem('reservaMover'));
          
            vm.RESERVA.push({
                "id": reserva.id,
                "idcancha": reserva.idCancha,
                "nombreCancha": reserva.nombrecancha,
                "fecha": reserva.fecha,
                "diaSemana": reserva.diaSemana,
                "hora": reserva.hora
            });
            vm.Cliente.existe = true;
            vm.Cliente.image = reserva.image;
            vm.Cliente.url = reserva.url;
            vm.Cliente.telefono = parseInt(reserva.telefono);
            vm.Cliente.nombres = reserva.nombres;
            vm.Cliente.cumplidas = reserva.cumplidas;
            vm.Cliente.resenia = reserva.resenia;
            vm.Cliente.incumplidas = reserva.incumplidas;
            vm.Cliente.canceladas = reserva.canceladas;
        }
        function message(msg) {
            $ionicLoading.show({template: msg, noBackdrop: true, duration: 2000});
        }
    }
})();

