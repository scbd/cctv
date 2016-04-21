define(['require', 'app', 'angular', 'ngRoute', 'lodash'], function(require, app, angular) { 'use strict';

    var baseUrl = require.toUrl('');

    app.provider('extendedRoute', ["$routeProvider", function($routeProvider) {

        var __when = $routeProvider.when.bind($routeProvider);

        //============================================================
        //
        //
        //============================================================
        function new_when(path, route) {

            var templateUrl = route.templateUrl;
            var templateModule;

            if(templateUrl) {

                if(templateUrl.indexOf('/')!==0) {
                    route.templateUrl = baseUrl + templateUrl;
                    templateModule  = changeExtension(templateUrl, '');
                }
                else {
                    templateModule = changeExtension(templateUrl, '.js');
                }
            }

            var ext = { resolve: route.resolve || {} };

            if(!route.controller && route.resolveController && typeof(route.resolveController)=="string")
                templateModule = route.resolveController;

            if(!route.controller && route.resolveController) {
                ext.controller         = proxy;
                ext.resolve.controller = resolveController(templateModule);
            }

            if(!route.controllerAs && route.resolveController) {
                route.controllerAs = buildControllerName(templateModule);
            }

            return __when(path, angular.extend(route, ext));
        }

        //********************************************************************************
        //********************************************************************************
        //********************************************************************************
        //********************************************************************************

        function changeExtension(path, ext) {

            return path.replace(/(\.[a-z0-9]+$)/gi, ext);
        }

        //============================================================
        //
        //
        //============================================================
        function buildControllerName(templateModule) {

            var name = templateModule.split('/').pop() + '-ctrl';

            return name.replace(/[\-_](\w)/g, function(match) { // toCamelCase
                return match[1].toUpperCase();
            });
        }

        //============================================================
        //
        //
        //============================================================
        function proxy($injector, $scope, $route, controller) {

            if(!controller)
                return;

            var locals = angular.extend($route.current.locals, { $scope: $scope });

            return $injector.instantiate(controller, locals);
        }
        proxy.$inject = ['$injector', '$scope', '$route', 'controller'];

        //============================================================
        //
        //
        //============================================================
        function resolveController(controllerModule) {

            return ['$q', function($q) {

                var deferred = $q.defer();

                require([controllerModule], function (module) {
                    deferred.resolve(module);
                }, function(error){
                    console.error  (error);
                    console.error  ("controller not found: " + controllerModule);
                    deferred.reject("controller not found: " + controllerModule);
                });

                return deferred.promise;
            }];
        }

        return angular.extend($routeProvider, { when: new_when });
    }]);
});
