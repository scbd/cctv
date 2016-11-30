define(['app', 'services/cctv-stream', 'services/caches'], function() { "use strict";

	return ['cctvStream', function(cctvStream) {

        var _ctrl = this;

        cctvStream.initialize().then(function(){

            _ctrl.eventGroup   = cctvStream.event;
            _ctrl.title        = cctvStream.event.Title.en.replace(/-/g, '‑') //replace - by a non-breaking one
            _ctrl.descriptions = ((cctvStream.event.schedule||{}).description || cctvStream.event.Description.en).split('\n');

        });

	}];
});
