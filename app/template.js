define(['app', 'filters/moment', 'directives/no-cursor', 'directives/auto-scroll', 'services/caches', 'services/cctv-stream'], function(app) { 'use strict';

    app.controller('TemplateController', ['$rootScope', '$http', '$timeout', '$interval', '$q', '$location', '$injector', 'cctvCache', 'cctvStream',
                                  function($rootScope,   $http,   $timeout,   $interval,   $q,   $location,   $injector,   cctvCache,   cctvStream) {

        var _ctrl = this;

        if($location.path()=='/authorization') return this;
        if($location.path()=='/current')       return this;

        if($location.path()!='/')
            $location.path('/').replace();

        if(!cctvStream.streamId)
            $location.path('/help/not-configured').replace();

        _ctrl.completed  = completed;

        cctvStream.on('announcement', nextFrame);
        cctvStream.on('schedule',     nextFrame);
        cctvStream.on('room',         nextFrame);
        cctvStream.on('news',         nextNews);
        cctvStream.on('help',         helpFrame);

        cctvStream.initialize().then(function(){

            _ctrl.event = cctvStream.event;

        }).catch(function(err){

            console.error(err.data || err);

        }).finally(function(){

            updateTime();
            $interval(updateTime, 1000*15);
        });

        //==============================
        //
        //==============================
        function updateTime() {
            _ctrl.now = cctvStream.now();
        }

        //==============================
        //
        //==============================
        function nextNews(news) {
            _ctrl.news = news;
        }

        //==============================
        //
        //==============================
        function nextFrame(frame) {

            _ctrl     .frame = frame;
            $rootScope.frame = frame;

            var lastRoute = $location.path();

            $location.path('/'+frame.content.type+'/'+frame._id).replace();

            if(lastRoute==$location.path()){
                $injector.invoke(["$route", function($route) {
                    $route.reload();
                }]);
            }
        }

        //==============================
        //
        //==============================
        function completed(frame) {
            if(frame)
                frame.completed();
        }

        //==============================
        //
        //==============================
        function helpFrame() {
            $location.path('/help/event-information').replace();
        }
    }]);
});
