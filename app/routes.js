define(['app', 'providers/extended-route', 'ngRoute'], function(app, _) { 'use strict';

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/',                  { templateUrl : 'views/index.html',               resolveController : true } ).
            when('/announcement/:id',  { templateUrl : 'views/frames/announcement.html', resolveController : true } ).
            when('/schedule/:id',      { templateUrl : 'views/frames/schedule.html',     resolveController : true } ).
            when('/authentication',    { templateUrl : 'views/authentication.html',      resolveController : true } ).
            otherwise({redirectTo: '/'});
    }]);
});
