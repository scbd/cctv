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
                    $http.get('/api/v2016/reservation-types', { cache : cctvCache }),
                    $http.get('/api/v2016/venue-rooms',       { cache : cctvCache, params: { q: { venue : venueId } } })
                ]);

            }).then(function(res) {

                _ctrl.types = _.reduce(res[0].data, function(ret, r){ ret[r._id] = r; return ret; }, {});
                _ctrl.rooms = _.reduce(res[1].data, function(ret, r){ ret[r._id] = r; return ret; }, {});
                _ctrl.frame = frame;
                _ctrl.reservations = _.sortBy(frame.reservations, sortKey);

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

            var typePriority = ((_ctrl.types[ r.type              ]||{}).priority || 1000000).toString().substr(1);
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
