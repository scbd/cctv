define(['app'], function() { "use strict";

	return ['$http', '$location', function($http, $location) {

        $http.get('/api/v2016/conferences', { params: {
            q: {
                $or: [ 
                    { "conference.streamId"           :{ "$exists": true } }, 
                    { "conference.defaultCctvStreamId":{ "$exists": true } }, 
                ],
                "active" :true
            },
            f:  { "conference.streamId" : 1, "conference.defaultCctvStreamId" : 1, "EndDate":1 },
            s:  { "EndDate": -1 },
            fo: 1
        }}).then(function(res){
            var conference = res.data.conference;
            var streamId   = conference.defaultCctvStreamId || conference.streamId;

            if(!streamId) throw new Error("No streamId found");

            var queryStringParams = $location.search() || {};

            queryStringParams.streamId = streamId;

            $location.search(queryStringParams)
            $location.path('/');

        }).catch(function(err){

            $location.path('/');

        }).finally(function(){
            window.location = $location.absUrl(); // Force reload new location
        })
	}];
});
