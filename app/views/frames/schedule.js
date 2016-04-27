define(['moment-timezone', 'lodash', 'app', 'directives/auto-scroll', 'services/caches', 'services/cctv-stream'], function(moment, _) { "use strict";

	return ['$scope', '$http', '$route', '$q', '$timeout', 'cctvCache', 'cctvStream', function($scope, $http, $route, $q, $timeout, cctvCache, cctvStream) {

        var _eventGroups_Venues_Maps = { '56ab766f2f4ad2ad1b885444' : '56d76c787e893e40650e4170' }; //TMP

        var _ctrl = this;

        _ctrl.completed = completed;
    
        load();

        return this;

        //========================================
        //
        //========================================
        function load() {

            var venueId;

            cctvStream.initialize().then(function(){

                return $http.get('/api/v2016/cctv-frames/'+$route.current.params.id, { cache : cctvCache });

            }).then(function(res) {

                _ctrl.frame = res.data;

                return res.data;

            }).then(function(frame) {

                venueId = _eventGroups_Venues_Maps[frame.eventGroup];

                var qTypes = $http.get('/api/v2016/reservation-types', { cache : cctvCache }).then(function(res) {

                    _ctrl.types = _.reduce(res.data, function(ret, r){
                        ret[r._id] = r;
                        return ret;
                    }, {});
                });

                var qRooms = $http.get('/api/v2016/venue-rooms', { params: { q: { venue : venueId } }, cache : cctvCache }).then(function(res) {

                    _ctrl.rooms = _.reduce(res.data, function(ret, r){
                        ret[r._id] = r;
                        return ret;
                    }, {});
                });

                return $q.all([qTypes, qRooms]).then(function(){
                    return frame;
                });

            }).then(function(frame) {

                var reservationTypes = frame.content.reservationTypes;

                // vvvvvvv TMP: values in DB are in UTC Format as local. we have to offset the UTC value to venue localtime

                var now      = moment.tz(cctvStream.now(),      cctvStream.event.timezone);
                var tomorrow = moment.tz(cctvStream.tomorrow(), cctvStream.event.timezone);

                now      = moment.tz(now     .format('YYYY-MM-DDTHH:mm:ss'), 'UTC').toDate(); // TMP: offset the specified datetime UTC value to localtime
                tomorrow = moment.tz(tomorrow.format('YYYY-MM-DDTHH:mm:ss'), 'UTC').toDate(); // TMP: offset the specified datetime UTC value to localtime

                // ^^^^^^^^ TMP: values in DB are in UTC Format as local. we have to offset the UTC value to venue localtime

                var query = {
                    "location.venue" : venueId,
                    "meta.status": { $ne : 'deleted' },
                    "type" : { $in : reservationTypes },
                    "$and" : [
                        { "end"  : { $gte : { $date : now      } } },
                        { "start": { $lt  : { $date : tomorrow } } }
                    ]
                };

                var fields = {
                    start: 1,
                    end: 1,
                    title: 1,
                    type: 1,
                    description: 1,
                    location: 1,
                    message: 1,
                    'sideEvent.title': 1
                };
                return $http.get('/api/v2016/reservations', { params : { q : query, f : fields, s: { start:1 } } }).then(function(res) {

                    var reservations = res.data;

                    reservations.forEach(function(r){
                        r.start = moment.tz(r.start.replace(/Z$/, ''), cctvStream.event.timezone).toDate(); // TMP:  Drop the 'Z' UTC timezone and assume local venue time
                        r.end   = moment.tz(r.end  .replace(/Z$/, ''), cctvStream.event.timezone).toDate(); // TMP:  Drop the 'Z' UTC timezone and assume local venue time
                    });

                    return reservations;
                });

            }).then(function(reservations) {

                _ctrl.reservations = reservations;

            }).catch(function(err) {

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
