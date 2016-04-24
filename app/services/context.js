define(['app', 'moment-timezone', 'ngCookies', 'services/caches'], function(app, moment) { 'use strict';

    app.provider('context', [function() {

        var _timezones = {};

        this.$get = ['$location', '$cookies', '$http', 'cctvCache', function($location, $cookies, $http, cctvCache){

            var ready = !!venueTimezone();

            if(!ready) {
                ready = $http.get('/api/v2016/cctv-streams/'+streamId(), { cache: cctvCache }).then(function(res) {
                    _timezones[streamId] = res.data.eventGroup.timezone;
                    ready = true;
                    return ready;
                });
            }

            return {
                streamId : streamId,
                now      : now,
                tomorrow : tomorrow,
                venueTimezone : venueTimezone,
                ready : function() { return ready; }
            };

            function streamId() {
                return $location.search().streamId || $cookies.get('streamId');
            }

            function now() {
                return moment($location.search().datetime||new Date()).toDate();
            }

            function tomorrow() {
                return moment.tz(now(), venueTimezone()).add(1, 'days').startOf('day').toDate();
            }

            function venueTimezone() {
                return _timezones[streamId()];
            }
        }];
    }]);
});
