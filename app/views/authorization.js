define(['lodash', 'jquery', 'moment-timezone', 'ngCookies'], function(_, $, moment) { "use strict";

	return ['$cookies', '$http', '$location', '$window', function($cookies, $http, $location, $window) {

        var _ctrl = this;

        _ctrl.streamId     = $cookies.get('streamId');
        _ctrl.close        = close;
        _ctrl.save         = save;
        _ctrl.deletMonitor = deletMonitor;
        _ctrl.saveStreamId = saveStreamId;

        load();

        //==============================
        //
        //==============================
        function load() {

            clearError();

            delete _ctrl.authorized;

            var query = {
                timezone: { $exists: true },
                venueId:  { $exists: true }, // TMP for compatibility with coference collection;
            };

            $http.get('/api/v2016/event-groups', { params : { q : query, s : { StartDate : 1 } } }).then(function(res){

                if(!_ctrl.eventGroupId)
                    _ctrl.eventGroupId = _.first(res.data)._id;

                _ctrl.eventGroups = res.data;
            });

            $http.get('/api/v2016/cctv-streams/monitors/authorization').then(function(res) {

                _ctrl.authorized = true;

                return res.data;

            }).catch(function(err) {

                _ctrl.authorized = false;

                if(~[400,401,403].indexOf(err.status))
                    return restore();

                throw err;

            }).then(function(monitor) {

                backup(monitor);

                _ctrl.monitor = monitor;

            }).catch(handleError);
        }

        //==============================
        //
        //==============================
        function save() {

            clearError();

            var credentials = { email: _ctrl.email, password: _ctrl.password };

            var data = {
                monitor : _.pick(_ctrl.monitor, 'id', 'location'),
                eventGroupId : _ctrl.eventGroupId,
            };

            $http.post('/api/v2013/authentication/token', credentials).then(function (res) {

                var token = res.data.authenticationToken;

                return $http.post('/api/v2016/cctv-streams/monitors/authorization', data, { headers : { authorization : 'Token ' + token } });

            }).then(function(res){

                backup(res.data.monitor);

                saveStreamId(res.data.expires);

                $cookies.put('authenticationToken', res.data.authenticationToken, { expires : res.data.expires });

                close();

            }).catch(handleError);

        }

        //==============================
        //
        //==============================
        function saveStreamId(expires) {

            expires = expires || _.findWhere(_ctrl.eventGroups, { _id : _ctrl.eventGroupId }).EndDate;

            if(_ctrl.streamId) $cookies.put   ('streamId', _ctrl.streamId, { expires : moment(expires).toDate() });
            else               $cookies.remove('streamId');
        }

        //==============================
        //
        //==============================
        function deletMonitor() {
            $cookies.remove('authenticationToken');
            load();
        }

        //==============================
        //
        //==============================
        function close() {

            $location.path($('base').attr('href') || '/');

            $window.location = $location.absUrl();
        }

        //==============================
        //
        //==============================
        function generateCode(len) {

            var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var code = "";

            for(var i=0; i<len;++i)
                code += chars[(Math.random()*chars.length)|0];

            return code;
        }

        //==============================
        //
        //==============================
        function backup(monitor) {

            $window.localStorage.setItem('monitorInfo', JSON.stringify(monitor));
        }

        //==============================
        //
        //==============================
        function restore() {

            try {

                var monitorInfo = JSON.parse($window.localStorage.getItem('monitorInfo'));

                if(!monitorInfo.id)
                    throw monitorInfo;

                return monitorInfo;

            } catch (e) {

                $window.localStorage.removeItem('monitorInfo');

                return { id : generateCode(48) };
            }
        }

        //==============================
        //
        //==============================
        function clearError() {
            delete _ctrl.error;
        }

        //==============================
        //
        //==============================
        function handleError(error) {

            console.log(error);

            error = (error || { message : "Unknown error"});
            error = error.data || error;
            _ctrl.error = error;
        }
	}];
});
