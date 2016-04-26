define(['app', 'directives/auto-scroll', 'services/caches', 'services/cctv-stream', 'filters/html-sanitizer'], function() { "use strict";

	return ['$scope', '$http', '$route', '$timeout', 'cctvCache', 'cctvStream', function($scope, $http, $route, $timeout, cctvCache, cctvStream) {

        var _ctrl = this;

        _ctrl.completed = completed;

        load();

        return this;

        //========================================
        //
        //========================================
        function load() {

            $http.get('/api/v2016/cctv-frames/'+$route.current.params.id, { cache : cctvCache }).then(function(res) {

                _ctrl.frame = res.data;

            }).catch(function(err){

                console.error(err.data || err);
                completed();
            });
        }

        //========================================
        //
        //========================================
        function completed() {
            cctvStream.completed(_ctrl.frame);
        }

	}];
});
