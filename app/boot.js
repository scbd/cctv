(function(document) { 'use strict';

    require.config({
        waitSeconds: 30,
        baseUrl : 'app/',
        paths: {
            'angular'         : 'libs/angular-flex/angular-flex',
            'ngRoute'         : 'libs/angular-route/angular-route.min',
            'ngCookies'       : 'libs/angular-cookies/angular-cookies.min',
            'ngAnimate'       : 'libs/angular-animate/angular-animate.min',
            'ngSanitize'      : 'libs/angular-sanitize/angular-sanitize.min',
            'text'            : 'libs/requirejs-text/text',
            'css'             : 'libs/require-css/css.min',
            'jquery'          : 'libs/jquery/dist/jquery.min',
            'bootstrap'       : 'libs/bootswatch-dist/js/bootstrap.min',
            'lodash'          : 'libs/lodash/lodash.min',
            'moment'          : 'libs/moment/min/moment.min',
            'moment-timezone' : 'libs/moment-timezone/builds/moment-timezone-with-data.min',
        },
        shim: {
            'libs/angular/angular.min' : { deps : ['jquery'] },
            'angular'                  : { deps : ['libs/angular/angular.min'] },
            'ngRoute'                  : { deps : ['angular'] },
            'ngCookies'                : { deps : ['angular'] },
            'ngAnimate'                : { deps : ['angular'] },
            'ngSanitize'               : { deps : ['angular'] },
            'bootstrap'                : { deps : ['jquery' ] },
        },
    });

    // BOOT
    require(['angular', 'app', 'bootstrap', 'routes', 'template'], function(ng, app) {
        ng.element(document).ready(function() {
            ng.bootstrap(document, [app.name]);
        });
    });
})(document);
// MISC

//==================================================
// Protect window.console method calls, e.g. console is not defined on IE
// unless dev tools are open, and IE doesn't define console.debug
//==================================================
(function fixIEConsole() { 'use strict';

    if (!window.console) {
        window.console = {};
    }

    var methods = ["log", "info", "warn", "error", "debug", "trace", "dir", "group","groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd", "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"];
    var noop    = function() {};

    for(var i = 0; i < methods.length; i++) {
        if (!window.console[methods[i]])
            window.console[methods[i]] = noop;
    }
})();
