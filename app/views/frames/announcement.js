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

                $timeout(completed, 5000);

            }).catch(function(err){

                console.error(err.data || err);
                completed();
            });
        }

        //========================================
        //
        //========================================
        function completed() {

            $scope.$emit('frameCompleted', _ctrl.frame);
        }

	}];
});
