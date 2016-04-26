define(['app', 'directives/no-cursor', 'directives/auto-scroll', 'services/caches', 'services/cctv-stream'], function(app) { 'use strict';

    app.controller('TemplateController', ['$rootScope', '$http', '$timeout', '$interval', '$q', '$location', '$injector', 'cctvCache', 'cctvStream',
                                  function($rootScope,   $http,   $timeout,   $interval,   $q,   $location,   $injector,   cctvCache,   cctvStream) {

        if($location.path()!='/')
            $location.path('/');

        if(!cctvStream.streamId)
            $location.path('/help/not-configured');

        var _ctrl = this;

        _ctrl.newsCompleted = newsCompleted;

        updateTime();
        $interval(updateTime, 1000*15);


        cctvStream.on('announcement', nextFrame);
        cctvStream.on('schedule',     nextFrame);
        cctvStream.on('news',         nextNews);
        cctvStream.on('help',         helpFrame);

        cctvStream.initialize().then(function(){
            _ctrl.event = cctvStream.event;
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

            var lastRoute = $location.path();

            $location.path('/'+frame.content.type+'/'+frame._id);

            if(lastRoute==$location.path()){
                $injector.invoke(["$route", function($route) {
                    $route.reload();
                }]);
            }
        }

        //==============================
        //
        //==============================
        function newsCompleted() {
            if(_ctrl.news)
                _ctrl.news.completed();
        }

        //==============================
        //
        //==============================
        function helpFrame() {
            $location.path('/help/event-information');
        }
    }]);
});
