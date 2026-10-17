import angular from 'angular';
import $ from 'jquery';
import 'ngSanitize';
import 'ngRoute';
import 'ngCookies';
import 'ngAnimate';

    var deps = ['ngSanitize', 'ngRoute', 'ngCookies', 'ngAnimate'];

    angular.defineModules(deps);

    var app = angular.module('app', deps);

    app.config(['$httpProvider', '$cookiesProvider', function($httpProvider, $cookiesProvider) {

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('apiRebase');

        $cookiesProvider.defaults = {
            path : $('base').attr('href') || '/',
            secure : true
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
	}]);;


export default app;