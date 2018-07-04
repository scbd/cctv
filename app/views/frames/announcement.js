define(['lodash', 'jquery', 'app', 'directives/auto-scroll', 'services/caches', 'services/cctv-stream', 'filters/html-sanitizer'], function(_, $) { "use strict";

	return ['$rootScope', '$http', '$route', '$timeout', 'cctvCache', 'cctvStream', '$filter', function($rootScope, $http, $route, $timeout, cctvCache, cctvStream, $filter) {

        var _ctrl = this;

        _ctrl.completed = completed;

        init();

        return this;

        //========================================
        //
        //========================================
        function init() {

            var frame = $rootScope.frame;

            if(!frame) {
                completed();
                return;
            }

            _ctrl.frame = frame;
            _ctrl.frameList = frame.content.frameList || [frame];

            _.forEach(_ctrl.frameList, function(f){
                f.content.html = trimHtml(f.content.html);
            });
        }

        //========================================
        //
        //========================================
        function completed() {
            cctvStream.completed(_ctrl.frame);
        }

        //========================================
        //
        //========================================
        function trimHtml(html) {

            var sanitizeHtml = $filter('sanitizeHtml')(html);
            var dom = $('<div></div>').html(sanitizeHtml);

            dom.children().each(function(i,e) {
                e = $(e);

                // Remove empty nodes
                if(!e.text().replace(/\s*/g, '') && !e.find("img, hr").addBack("img, hr").size())
                    e.remove();
            });

            return dom.html();
        }
	}];
});
