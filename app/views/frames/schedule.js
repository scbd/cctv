define(['moment-timezone', 'lodash', 'app', 'services/caches'], function(moment, _) { "use strict";

	return ['$scope', '$http', '$route', '$q', '$timeout', '$location', 'cctvCache', function($scope, $http, $route, $q, $timeout, $location, cctvCache) {

        var _eventGroups_Venues_Maps = { '56ab766f2f4ad2ad1b885444' : '56d76c787e893e40650e4170' }; //TMP
        var _timezone = "UTC";

        var _ctrl = this;

        load();

        return this;

        //========================================
        //
        //========================================
        function load() {

            var params = $location.search();
            var now    = moment(params.datetime||'BAD');
            var tomorrow;

            if(!now.isValid())
                now = moment();

            return $http.get('/api/v2016/cctv-frames/'+$route.current.params.id, { cache : cctvCache }).then(function(res) {

                _ctrl.frame = res.data;

            }).then(function() {

                var qDates = getQueryDates().then(function(res){
                    now      = res.now;
                    tomorrow = res.tomorrow;
                });

                var qTypes = $http.get('/api/v2016/reservation-types', { cache : cctvCache }).then(function(res) {

                    _ctrl.types = _.reduce(res.data, function(ret, r){
                        ret[r._id] = r;
                        return ret;
                    }, {});
                });

                var venueId = _eventGroups_Venues_Maps[_ctrl.frame.eventGroup];

                var qRooms = $http.get('/api/v2016/venue-rooms', { params: { q: { venue : venueId } }, cache : cctvCache }).then(function(res) {

                    _ctrl.rooms = _.reduce(res.data, function(ret, r){
                        ret[r._id] = r;
                        return ret;
                    }, {});
                });

                return $q.all([qDates, qTypes, qRooms]);

            }).then(function() {

                var venueId = _eventGroups_Venues_Maps[_ctrl.frame.eventGroup];
                var reservationTypes = _ctrl.frame.content.reservationTypes;

                var query = {
                    "location.venue" : venueId,
                    "type" : { $in : reservationTypes },
                    "$and" : [
                        { "end"  : { $gte : { $date : now     .toDate() } } },
                        { "start": { $lt  : { $date : tomorrow.toDate() } } }
                    ]
                };

                var fields = { start:1, end:1, title: 1, type : 1, description : 1, location:1 };

                return $http.get('/api/v2016/reservations', { params : { q : query, f : fields } }).then(function(res) {

                    var reservations = res.data;

                    reservations.forEach(function(r){
                        r.start = moment.tz(r.start.replace(/Z$/, ''), _timezone).toDate(); // TMP:  Drop the 'Z' UTC timezone and assume local venue time
                        r.end   = moment.tz(r.end  .replace(/Z$/, ''), _timezone).toDate(); // TMP:  Drop the 'Z' UTC timezone and assume local venue time
                    });

                    return reservations;
                });

            }).then(function(reservations) {

                _ctrl.reservations = reservations;

            }).then(function() {

                ready(Math.max(10000, _ctrl.reservations.lenght*1000));

            }).catch(function(err) {

                console.error(err.data || err);
                completed();
            });
        }

        //========================================
        //
        //========================================
        function getQueryDates() {

            return getVenueTimezone().then(function(timezone){

                _timezone = timezone;

                var now = moment($location.search().datetime||'BAD');
                var tomorrow;

                // HACK value in DB is stores as local.
                // we have to offset the UTC value

                now      = now.tz(timezone);
                tomorrow = moment(now).add(1, 'days').hour(0).minute(0).second(0).millisecond(0);

                now      = moment.tz(now     .format('YYYY-MM-DDTHH:mm:ss'), 'UTC'); // TMP: offset the specified datetime UTC value to localtime
                tomorrow = moment.tz(tomorrow.format('YYYY-MM-DDTHH:mm:ss'), 'UTC'); // TMP: offset the specified datetime UTC value to localtime

                return {
                    now : now,
                    tomorrow : tomorrow
                };
            });
        }

        //========================================
        //
        //========================================
        function getVenueTimezone() {

            return $http.get('/api/v2016/event-groups/'+_ctrl.frame.eventGroup, { cache : cctvCache }).then(function(res) {
                return res.data.timezone;
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
