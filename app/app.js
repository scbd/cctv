define(['angular', 'jquery', 'ngSanitize', 'ngRoute', 'ngCookies', 'ngAnimate'], function(angular, $) { 'use strict';

    var deps = ['ngSanitize', 'ngRoute', 'ngCookies', 'ngAnimate'];

    angular.defineModules(deps);

    var app = angular.module('app', deps);

    app.config(['$httpProvider', '$cookiesProvider', function($httpProvider, $cookiesProvider) {

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
        $httpProvider.interceptors.push('apiRebase');

        $cookiesProvider.defaults = {
            path : $('base').attr('href') || '/',
            secure : true
        };
    }]);

    app.factory('authenticationHttpIntercepter', ["$q", "$cookies", function($q, $cookies) {

        return {
            request: function(config) {

                var trusted = /^https:\/\/api.cbd.int\//i.test(config.url) ||
                              /^\/api\//i                .test(config.url);

                var hasAuthorization = (config.headers||{}).hasOwnProperty('Authorization') ||
                                       (config.headers||{}).hasOwnProperty('authorization');

                var token = $cookies.get('authenticationToken');

                if(trusted && !hasAuthorization && token) {
                    config.headers = angular.extend(config.headers||{}, {
                        Authorization : "Token " + token
                    });
                }

                return config;
            }
        };
    }]);

	app.factory('apiRebase', ["$location", function($location) {

		return {
			request: function(config) {

                var rewrite = config  .url   .toLowerCase().indexOf('/api/')===0 &&
                             $location.host().toLowerCase() == 'www.cbd.int';

				if(rewrite)
                    config.url = 'https://api.cbd.int' + config.url;

				return config;
			}
		};
	}]);

    return app;
});
