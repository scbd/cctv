define(['app', 'providers/extended-route', 'ngRoute'], function(app, _) { 'use strict';

    app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/',                       { templateUrl : 'views/help/loading.html',           resolveController : false } ).
            when('/current',                { templateUrl : 'views/help/loading.html',           resolveController : 'views/help/auto-detect' } ).
            when('/help/not-configured',    { templateUrl : 'views/help/not-configured.html',    resolveController : false } ).
            when('/help/event-information', { templateUrl : 'views/help/event-information.html', resolveController : true  } ).

            when('/announcement/:id?',      { templateUrl : 'views/frames/announcement.html',    resolveController : true  } ).
            when('/schedule/:id?',          { templateUrl : 'views/frames/schedule.html',        resolveController : true  } ).
            when('/room/:id?',              { templateUrl : 'views/frames/schedule.html',        resolveController : true  } ).
            when('/authorization' ,         { templateUrl : 'views/authorization.html',          resolveController : true  } );
    }]);
});
