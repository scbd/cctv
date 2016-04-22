define(['app', 'services/caches', 'filters/html-sanitizer'], function() { "use strict";

	return ['$scope', '$http', '$route', '$timeout', 'cctvCache', function($scope, $http, $route, $timeout, cctvCache) {

        var _ctrl = this;

        load();

        return this;

        //========================================
        //
        //========================================
        function load() {

            $http.get('/api/v2016/cctv-frames/'+$route.current.params.id, { cache : cctvCache }).then(function(res) {

                _ctrl.frame = res.data;

            }).then(function(){

                ready(_ctrl.frame.timeout);

            }).catch(function(err){

                console.error(err.data || err);
                completed();
            });
        }

        //========================================
        //
        //========================================
        function ready(timeout) {

            $scope.$emit('frameReady', _ctrl.frame, timeout);
        }

        //========================================
        //
        //========================================
        function completed() {

            $scope.$emit('frameCompleted', _ctrl.frame);
        }

	}];
});
