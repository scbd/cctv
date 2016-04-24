define(['app', 'lodash', 'moment-timezone', 'jquery', 'services/caches', 'services/context'], function(app, _, moment, $) { 'use strict';

    app.controller('TemplateController', ['$rootScope', '$http', '$timeout', '$interval', '$q', '$location', '$injector', 'cctvCache', 'context',
                                  function($rootScope,   $http,   $timeout,   $interval,   $q,   $location,   $injector,   cctvCache,   context) {

        if($location.path()!='/')
            $location.path('/');

        if(!context.streamId())
            $location.path('/help/not-configured');

        var _streamData;
        var _frames;
        var _frameTimer;
        var _news;
        var _newsTimer;

        var _ctrl = this;

        $rootScope.$on('frameReady',     function(evt, f, t) { frameReady    (f, t); } );
        $rootScope.$on('frameCompleted', function(evt, f)    { frameCompleted(f);    } );

        updateTime();
        load();
        nextFrame();
        nextNews();

        $interval(updateTime, 1000*15);

        //==============================
        //
        //==============================
        function updateTime() {
            _ctrl.now = context.now();
        }

        //==============================
        //
        //==============================
        function load() {

            var params = $location.search();

            var streamId = context.streamId();
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

                $location.path('/help/not-configured');

                throw err;
            });

            return _streamData;
        }

        //==============================
        //
        //==============================
        function nextNews() {

            var newsList = _news;

            if(!newsList || !newsList.length) {

                newsList = $q.when(_streamData).then(function(data) {

                    _news = _.filter(data.frames, function(f) { return f.content.type=='news'; });

                    return _news;
                });
            }

            return $q.when(newsList).then(function(newsList) {

                _ctrl.news = newsList.shift();

                return _ctrl.news;

            }).then(function(news) {

                setNewsTimer(news ? 10000 : 2000); // backup refresh

                return news;

            }).catch(function(err) {

                console.error(err.data || err);

                _frames = [];

                load();

                setNewsTimer(5000);
            });

        }

        //==============================
        //
        //==============================
        function setNewsTimer(timeout) {

            if(_newsTimer)
                $timeout.cancel(_newsTimer);

            _newsTimer = null;

            if(timeout)
                _newsTimer = $timeout(nextNews, timeout);
        }


        //==============================
        //
        //==============================
        function nextFrame() {

            setFrameTimer(null);

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

                if(frame) {

                    var lastRoute = $location.path();

                    $location.path('/'+frame.content.type+'/'+frame._id);

                    if(lastRoute==$location.path()){
                        $injector.invoke(["$route", function($route) {
                            $route.reload();
                        }]);
                    }
                }
                else
                    $location.path('/help/event-information');

                return frame;

            }).then(function(frame) {

                setFrameTimer(frame.timeout || 10000); // backup refresh

                return frame;

            }).catch(function(err) {

                console.error(err.data || err);

                _frames = [];

                load();

                setFrameTimer(5000);
            });
        }

        //==============================
        //
        //==============================
        function setFrameTimer(timeout) {

            if(_frameTimer)
                $timeout.cancel(_frameTimer);

            _frameTimer = null;

            if(timeout)
                _frameTimer = $timeout(nextFrame, timeout);
        }

        //==============================
        //
        //==============================
        function autoScroll(timeout) {

            var top = neededScroll();

            if(top) {
                $timeout(function () {
                    $("ng-view").animate({ scrollTop: top }, { duration: timeout, easing: 'linear' });
                }, 2000);

                return timeout+2000+2000; //wait scroll wait
            }

            return timeout;
        }

        //==============================
        //
        //==============================
        function neededScroll() {

            var view    = $("ng-view:last").height();
            var content = $("ng-view:last > :first-child").height();

            return Math.max(content - view, 0);
        }

        //==============================
        //
        //==============================
        function frameReady(frame, timeout) {

            $rootScope.$applyAsync(function(){

                timeout = timeout || frame.timeout || 10*1000;

                if(neededScroll()) {
                    timeout = autoScroll(timeout);
                }

                setFrameTimer(timeout);
            });
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
