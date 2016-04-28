define(['app', 'moment-timezone'], function(app, moment) { 'use strict';

    app.filter('moment', [function() {

        return function(datetime, method, arg1, arg2, arg3) {
            return moment(datetime)[method](arg1, arg2, arg3);
        };
    }]);

});
