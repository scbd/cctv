define(['angular', 'ngSanitize', 'ngRoute', 'ngCookies', 'ngAnimate'], function(angular) { 'use strict';

    var deps = ['ngSanitize', 'ngRoute', 'ngCookies', 'ngAnimate'];

    angular.defineModules(deps);

    var app = angular.module('app', deps);

    app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.useApplyAsync(true);
    }]);

    return app;
});
