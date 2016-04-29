define(['app', 'directives/auto-scroll', 'services/caches', 'services/cctv-stream', 'filters/html-sanitizer'], function() { "use strict";

	return ['$rootScope', '$http', '$route', '$timeout', 'cctvCache', 'cctvStream', function($rootScope, $http, $route, $timeout, cctvCache, cctvStream) {

        var _ctrl = this;

        _ctrl.completed = completed;

        init();

        return this;

        //========================================
        //
        //========================================
        function init() {

            var frame = $rootScope.frame;

            if(!frame) {
                completed();
                return;
            }

            _ctrl.frame = frame;
        }

        //========================================
        //
        //========================================
        function completed() {
            cctvStream.completed(_ctrl.frame);
        }

	}];
});
