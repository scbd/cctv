define(['app'], function() { "use strict";

	return ['$http', '$location', function($http, $location) {

        $http.get('/api/v2016/conferences', { params: {
            q: { 
                "conference.streamId":{ "$exists":true}, 
                "active" :true
            },
            f:  { "conference.streamId" : 1, "EndDate":1 },
            s:  { "EndDate": -1 },
            fo: 1
        }}).then(function(res){
            var streamId = res.data.conference.streamId

            $location.search({streamId: streamId })
            $location.path('/');

        }).catch(function(err){

            $location.path('/');

        }).finally(function(){
            window.location = $location.absUrl(); // Force reload new location
        })
	}];
});
