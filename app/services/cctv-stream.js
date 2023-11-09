import app from '~/app';
import _ from 'lodash';
import moment from 'moment-timezone';
import 'ngCookies';
import '~/services/caches';

    app.provider('cctvStream', [function() {

        this.$get = ['$location', '$cookies', '$http', '$q', '$timeout', '$window', 'cctvCache', function($location, $cookies, $http, $q, $timeout, $window, cctvCache){

            //========================================
            //
            //========================================
            function CctvStream(options) {

                var _cctvStream = this;

                _cctvStream.streamId  = options.streamId;
                _cctvStream.overrides = options.overrides||{};
                _cctvStream.event     = null;
                _cctvStream.listeners = {};

                _cctvStream.initialize = function(){

                    if(_cctvStream.event)
                        return $q.resolve();

                    return $q.when(_cctvStream.streamId).then(function(){

                        return $http.get('/api/v2016/cctv-streams/'+encodeURIComponent(_cctvStream.streamId), { cache: cctvCache, params: { cache: true} });

                    }).then(function(res) {

                        _cctvStream.event = res.data.eventGroup;

                        moment.tz.setDefault(res.data.eventGroup.timezone);

                        return _cctvStream.refreshStreamData();

                    }).then(function() {
                        $timeout(function() { _cctvStream.nextFrame(); }, 250);
                        $timeout(function() { _cctvStream.nextNews();  }, 250);
                    }).finally(function(){
                        $timeout(function() { _cctvStream.fullReload = true; }, 60*60*1000); // for full refresh every hour on next cycle
                    });
                };
            }

            //========================================
            //
            //========================================
            CctvStream.prototype.now = function(){
                return moment(this.overrides.now || new Date()).toDate();
            };

            //========================================
            //
            //========================================
            CctvStream.prototype.on = function(type, callback) {
                this.listeners[type] = this.listeners[type] || [];
                this.listeners[type].push(callback);
            };

            //========================================
            //
            //========================================
            CctvStream.prototype.dispatch = function(frame, typeOverride) {

                var _cctvStream = this;
                var listeners   = _cctvStream.listeners[typeOverride || frame.content.type];

                if(frame) {
                    frame.ready     = function(timeout) { _cctvStream.ready(this, timeout ); };
                    frame.completed = function()        { _cctvStream.completed(this);       };
                }

                if(listeners && listeners.length) {
                    listeners.forEach(function(callback){
                        callback(frame);
                    });
                }
                else {
                    _cctvStream.completed(frame);
                }
            };

            //========================================
            //
            //========================================
            CctvStream.prototype.completed = function(frame) {

                var type = frame && frame.content && frame.content.type;

                if(type == 'news') this.nextNews();
                else               this.nextFrame();
            };

            //========================================
            //
            //========================================
            CctvStream.prototype.ready = function(frame, timeout) {

                if(!frame || !frame.content)
                    return;

                var type = frame.content.type;

                if(timeout===undefined)
                    timeout = frame.timeout || (type == 'news' ? 5000 : 10000);

                if(type == 'news') this.setNewsTimer (timeout);
                else               this.setFrameTimer(timeout);
            };

            //========================================
            //
            //========================================
            CctvStream.prototype.nextFrame = function() {

                var _cctvStream = this;

                _cctvStream.setFrameTimer(null);

                var frames = _cctvStream.frameList;

                if(!frames || !frames.length) {

                    frames = $q.when(_cctvStream.streamData).then(function(data) {

                        _cctvStream.frameList = _.filter(data.frames, function(f) { return f.content.type!='news'; });

                        //  vvv combine announcement into a sigle virtual frame vvv

                        var announcements = _.filter(_cctvStream.frameList, function(f) { return f.content.type=='announcement'; });

                        if(announcements.length) {

                            _cctvStream.frameList = _.difference(_cctvStream.frameList, announcements);
                            _cctvStream.frameList.push({
                                _id : "v"+new Date().getTime(),
                                content : {
                                    type : 'announcement',
                                    frameList : announcements
                                }
                            });
                        }

                        //  ^^^ combine announcement into a sigle virtual frame ^^^

                        return _cctvStream.frameList;
                    });
                }

                var nextTimeout = 5000;

                return $q.when(frames).then(function(frames) {

                    if( frames.length<=1) _cctvStream.refreshStreamData();
                    if(!frames.length)    nextTimeout = 60000;

                    var frame = frames.shift();

                    if(frame) _cctvStream.dispatch(frame);
                    else      _cctvStream.dispatch(null, 'help');

                    return frame;

                }).then(function(frame) {

                    _cctvStream.setFrameTimer(frame ? 4*60*1000 : nextTimeout); // backup refresh

                    $window.watchdog();

                    return frame;

                }).catch(function(err) {

                    console.error(err.data || err);

                    _cctvStream.frameList = [];

                    _cctvStream.refreshStreamData();

                    _cctvStream.setFrameTimer(30000);
                });
            };

            //==============================
            //
            //==============================
            CctvStream.prototype.setFrameTimer = function(timeout) {

                var _cctvStream = this;

                if(_cctvStream.frameTimer)
                    $timeout.cancel(_cctvStream.frameTimer);

                _cctvStream.frameTimer = timeout ? $timeout(function() { _cctvStream.nextFrame(); }, timeout) : null;
            };

            //==============================
            //
            //==============================
            CctvStream.prototype.nextNews = function() {

                var _cctvStream    = this;
                var newsList = _cctvStream.newsList;

                if(!newsList || !newsList.length) {

                    newsList = $q.when(_cctvStream.streamData).then(function(data) {

                        _cctvStream.newsList = _.filter(data.frames, function(f) { return f.content.type=='news'; });

                        return _cctvStream.newsList;
                    });
                }

                return $q.when(newsList).then(function(newsList) {

                    var news = newsList.shift();

                    _cctvStream.dispatch(news, 'news');

                    return news;

                }).then(function(news) {

                    _cctvStream.setNewsTimer(news ? 60000 : 2000); // backup refresh

                    return news;

                }).catch(function(err) {

                    console.error(err.data || err);

                    _cctvStream.newsList = [];

                    _cctvStream.refreshStreamData();

                    _cctvStream.setNewsTimer(30000);
                });
            };

            //==============================
            //
            //==============================
            CctvStream.prototype.setNewsTimer = function(timeout) {

                var _cctvStream = this;

                if(_cctvStream.newsTimer)
                    $timeout.cancel(_cctvStream.newsTimer);

                _cctvStream.newsTimer = timeout ? $timeout(function() { _cctvStream.nextNews(); }, timeout) : null;
            };

            //========================================
            //
            //========================================
            CctvStream.prototype.refreshStreamData = function() {

                var _cctvStream = this;
                var options  = { params : { cache: true } };

                if(_cctvStream.fullReload) {
                    console.log("Reload");
                    $window.location.reload(true);
                }

                if(_cctvStream.overrides.now)
                    options.params.datetime = _cctvStream.now();

                _cctvStream.streamData = $http.get('/api/v2016/cctv-streams/'+_cctvStream.streamId, options).then(function(res) {

                    cctvCache.cacheStream(res.data);

                    return res;

                }).catch(function(err) { //Error loading stream: try from cctvHttpCache

                    console.error(err.data || err);
                    console.error('Re-Try Loading stream with cached data');

                    return $http.get('/api/v2016/cctv-streams/'+_cctvStream.streamId, _.defaults({ cache : cctvCache, params : { cache: true } }, options));

                }).then(function(res) {

                    return (_cctvStream.streamData = res.data);

                }).catch(function(err){

                    console.error(err.data || err);

                    throw err;
                });

                return _cctvStream.streamData;
            };


            return new CctvStream({
                streamId  : $location.search().streamId || $cookies.get('streamId'),
                overrides : {
                    now : $location.search().datetime
                }
            });

        }];
    }]);
