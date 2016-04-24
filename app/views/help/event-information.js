define(['app', 'services/context', 'services/caches'], function() { "use strict";

	return ['$q', 'context', function($q, context) {

        var _ctrl = this;

        $q.when(context.ready()).then(function(){

            _ctrl.eventGroup   = context.eventGroup();
            _ctrl.descriptions = context.eventGroup().Description.en.split('\n');

        });

	}];
});
