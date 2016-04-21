define(['app', 'lodash', 'moment-timezone', 'ngCookies', 'services/caches'], function(app, _, moment) { 'use strict';

    app.controller('TemplateController', ['$rootScope', '$http', '$cookies', '$timeout', '$q', '$location', 'cctvCache', function($rootScope, $http, $cookies, $timeout, $q, $location, cctvCache) {

        var _streamData;
        var _frames;
        var _news;

        var _ctrl = this;

        $rootScope.$on('frameCompleted', frameCompleted);

        updateTime();
        load();
        nextFrame();

        //==============================
        //
        //==============================
        function updateTime() {

            _ctrl.now = new Date();

            $timeout(updateTime, 1000*60);
        }

        //==============================
        //
        //==============================
        function load() {

            var params = $location.search();

            var streamId = params.streamId;//$cookies.get('streamId');
            var options  = { params : { } };

            var previewDate = moment(params.datetime||'BAD');

            if(previewDate.isValid())
                options.params.datetime = previewDate.toDate();

            _streamData = $http.get('/api/v2016/cctv-streams/'+streamId, options).then(function(res) {

                cctvCache.cacheStream(res.data);

                return res;

            }).catch(function(err) { //Error loading stream: try from cctvHttpCache

                console.error(err.data || err);
                console.error('Re-Try Loading stream with cached data');

                return $http.get('/api/v2016/cctv-streams/'+streamId, _.defaults({ cache : cctvCache }, options));

            }).then(function(res) {

                _ctrl.eventGroup = res.data.eventGroup;

                _streamData = res.data;

                return _streamData;

            }).catch(function(err){

                console.error(err.data || err);
                throw err;
            });

            return _streamData;
        }

        //==============================
        //
        //==============================
        function nextFrame() {

            var frames = _frames;

            if(!frames || !frames.length) {

                frames = $q.when(_streamData).then(function(data) {

                    _frames = _.filter(data.frames, function(f) { return f.content.type!='news'; });

                    return _frames;
                });
            }

            return $q.when(frames).then(function(frames) {

                var frame = frames.shift();

                if(frames.length<=1)
                    load();

                if(frames)
                    $location.path('/'+frame.content.type+'/'+frame._id);
                else
                    $location.path('/');

                return frame;

            }).catch(function(err) {

                console.error(err.data || err);

                _frames = [];

                load();

                $timeout(nextFrame, 5000);
            });
        }

        //==============================
        //
        //==============================
        function nextNews() {
            console.log('TODO');
        }

        //==============================
        //
        //==============================
        function frameCompleted(frame) {

            if(frame && frame.content && frame.content.type=='news')
                nextNews();
            else
                nextFrame();
        }
    }]);
});
