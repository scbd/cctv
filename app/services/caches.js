import app from '~/app';

    app.factory('cctvCache', ['$cacheFactory', function($cacheFactory) {

        var cctvCache = $cacheFactory('cctv-cache', { capacity: 100 }); //LRU - least recent used

        //========================================
        //
        //========================================
        cctvCache.cacheStream = function(data) {

            var _this = this;

            _this.cachehttpData('/api/v2016/cctv-streams/'+data.feed.code,      data);
            _this.cachehttpData('/api/v2016/event-feeds/' +data.feed._id,       data.feed);
            _this.cachehttpData('/api/v2016/event-groups/'+data.eventGroup._id, data.eventGroup);

            data.frames.forEach(function(frame){
                _this.cachehttpData('/api/v2016/cctv-frames/'+frame._id, frame);
            });
        };

        //========================================
        //
        //========================================
        cctvCache.cachehttpData = function(url, data) {

            this.put(url, [200, JSON.stringify(data), {}, "OK"]);
        };

        return cctvCache;
    }]);