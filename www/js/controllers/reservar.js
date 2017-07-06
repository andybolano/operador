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

