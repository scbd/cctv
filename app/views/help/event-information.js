import '~/app'
import '~/services/caches'
import '~/services/cctv-stream'

export { default as template } from './event-information.html'

export default ['cctvStream', function(cctvStream) {

        var _ctrl = this;

        cctvStream.initialize().then(function(){

            _ctrl.eventGroup   = cctvStream.event;
            _ctrl.title        = ((cctvStream.event.schedule||{}).title       || cctvStream.event.Title.en).replace(/-/g, '‑') //replace - by a non-breaking one
            _ctrl.descriptions = ((cctvStream.event.schedule||{}).description || cctvStream.event.Description.en).split('\n');

        });

	}];
