define(['app'], function(app) { 'use strict';

    app.directive('noCursor', ['$timeout', function($timeout) {

        return {
            restrict: "A",
            link: function($scope, element, attr) {

                var timers  = [];
                var timeout = parseInt(attr.noCursor||3000);

                var lastX;
                var lastY;

                hideCursor();

                //==================================================
                //
                //==================================================
                $scope.$on('$destroy', function(){
                    clearTimers();
                });

                //==================================================
                //
                //==================================================
                element.mousemove(function(evt) {

                    if(lastX===undefined) lastX = evt.pageX;
                    if(lastY===undefined) lastY = evt.pageY;

                    var delta = Math.abs(evt.pageX - lastX)+
                                Math.abs(evt.pageY - lastY);

                    lastX = evt.pageX;
                    lastY = evt.pageY;

                    console.log(delta);

                    if(delta>10){
                        showCursor();
                        timers.push($timeout(hideCursor, timeout));
                    }
                });

                //==================================================
                //
                //==================================================
                function showCursor() {
                    clearTimers();
                    element.css('cursor', 'auto');
                }

                //==================================================
                //
                //==================================================
                function hideCursor() {
                    clearTimers();
                    element.css('cursor', 'none');
                }

                //==================================================
                //
                //==================================================
                function clearTimers() {
                    while(timers.length)
                        $timeout.cancel(timers.shift());
                }
            }
        };
    }]);
});
