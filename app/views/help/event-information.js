define(['app', 'services/cctv-stream', 'services/caches'], function() { "use strict";

	return ['cctvStream', function(cctvStream) {

        var _ctrl = this;

        cctvStream.initialize().then(function(){

            _ctrl.eventGroup   = cctvStream.event;
            _ctrl.descriptions = cctvStream.event.Description.en.split('\n');

        });

	}];
});
