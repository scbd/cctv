define(['moment-timezone', 'lodash', 'app', 'directives/auto-scroll', 'services/caches', 'services/cctv-stream'], function(moment, _) { "use strict";

	return ['$rootScope', '$http', '$route', '$q', '$timeout', 'cctvCache', 'cctvStream', function($rootScope, $http, $route, $q, $timeout, cctvCache, cctvStream) {

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

            cctvStream.initialize().then(function(){

                var venueId = cctvStream.event.venueId;

                return $q.all([
                    $http.get('/api/v2016/types',             { cache : cctvCache, params: { q: { schema: 'reservations' }, f: { title: 1, priority: 1, closed: 1, style: 1 } } }),
                    $http.get('/api/v2016/venue-rooms',       { cache : cctvCache, params: { q: { venue : venueId },        f: { title: 1, location: 1 } } })
                ]);

            }).then(function(res) {

                res[0].data = _.map(res[0].data, function(t) {
                    return _.defaults(t, {priority: 999999});
                });

                _ctrl.types = _.reduce(res[0].data, function(ret, r){ ret[r._id] = r; return ret; }, {});
                _ctrl.rooms = _.reduce(res[1].data, function(ret, r){ ret[r._id] = r; return ret; }, {});
                _ctrl.frame = frame;

                _ctrl.reservations = _(frame.reservations).map(function(r){
                    return _.defaults(r, {
                        open : !(_ctrl.types[r.type]||{}).closed
                    });
                }).sortBy(sortKey).value();

            }).catch(function(err) {
                console.error(err.data || err);
                completed();
            });
        }

        //========================================
        //
        //========================================
        function sortKey(r) {

            if(!r)
                return "zzz";

            var typePriority = ((_ctrl.types[ r.type              ]||{priority: 999999}).priority+1000000).toString().slice(-6);
            var roomPriority =  (_ctrl.rooms[(r.location||{}).room]||{}).title+' ';//     || 1000000;
            var timePriority = moment(r.start).format("HH:mm");

            return (timePriority + '-' + typePriority + '-' + roomPriority + '-' + (r.title||'')).toLowerCase();
        }

        //========================================
        //
        //========================================
        function completed() {
            cctvStream.completed(_ctrl.frame);
        }
	}];
});
