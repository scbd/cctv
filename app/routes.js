import app from '~/app';
import '~/providers/extended-route';
import 'ngRoute';
import * as viewAnnouncement from '~/views/frames/announcement';
import * as viewSchedule     from '~/views/frames/schedule';
import * as viewEventInfo    from '~/views/help/event-information';
import * as viewAutoDetect   from '~/views/help/auto-detect';
import * as viewAuthorization from '~/views/authorization';
import templateLoading  from '~/views/help/loading.html';
import templateNotConf  from '~/views/help/not-configured.html';

app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $routeProvider.
        when('/',                       { template :  templateLoading } ).
        when('/current',                { ...castView(viewAutoDetect) } ).

        when('/help/not-configured',    { template : templateNotConf  } ).
        when('/help/event-information', { ...castView(viewEventInfo), controllerAs: 'eventInformationCtrl'} ).

        when('/announcement/:id?',      { ...castView(viewAnnouncement)  , controllerAs: 'announcementCtrl' } ).
        when('/schedule/:id?',          { ...castView(viewSchedule)      , controllerAs: 'scheduleCtrl' } ).
        when('/room/:id?',              { ...castView(viewSchedule)      , controllerAs: 'scheduleCtrl' } ).
        when('/authorization' ,         { ...castView(viewAuthorization) , controllerAs: 'authorizationCtrl' });
}]);

function castView({ template, default: controller }) 
{
    return { template, controller };
}