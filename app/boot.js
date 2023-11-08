export const cdnUrl = null;

export default function bootApp(window, require, defineX) {
    
    const { document } = window;

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
            'moment-timezone' : 'libs/moment-timezone/builds/moment-timezone-with-data-10-year-range.min',
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



    if(document) { // BOOT App 
        
        var deps = [
            import('angular'),
            import('./app'),
            import('bootstrap'),
            import('./routes'),
            import('./template'),
        ];
        // BOOT
        Promise.all(deps).then(([ng, { default: app }]) => {
            ng.element(document).ready(function () {
            ng.bootstrap(document, [app.name]);
            });
        }).catch((e)=>{ console.error('Error bootstrapping the app:', e) });
    }
}