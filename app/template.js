import app from '~/app';
import '~/filters/moment';
import '~/directives/no-cursor';
import '~/directives/auto-scroll';
import '~/services/caches';
import '~/services/cctv-stream';

const ZoomRe = /^\d+(\.\d+)*$/;

    app.controller('TemplateController', ['$rootScope', '$http', '$timeout', '$interval', '$q', '$location', '$injector', 'cctvCache', 'cctvStream',
                                  function($rootScope,   $http,   $timeout,   $interval,   $q,   $location,   $injector,   cctvCache,   cctvStream) {

        const _ctrl = this;

        _ctrl.getLogoUri = getLogoUri

        var qs = $location.search();
        _ctrl.paddings = {
            'padding-left'  : qs.leftPadding,
            'padding-right' : qs.rightPadding
        }

        if(ZoomRe.test(qs.zoom||'')) document.body.style.zoom=qs.zoom;

        if($location.path()=='/authorization') return this;
        if($location.path()=='/current')       return this;

        if($location.path()!='/')
            $location.path('/').replace();

        if(!cctvStream.streamId)
            $location.path('/current').replace();

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

        //==============================
        //
        //==============================
        function getLogoUri() {
            const isCBD =  _ctrl?.event?.institution === 'CBD'
            const logo  = _ctrl?.event?.schedule?.cctv?.logo

            if(isCBD && !logo) return 'app/resources/images/cbd-leaf-white.svg'
            if(isCBD && logo) return logo

            if(!isCBD) return logo
        }
    }]);
