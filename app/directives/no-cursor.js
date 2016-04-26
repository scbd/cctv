define(['app'], function(app) { 'use strict';

    app.directive('noCursor', ['$timeout', function($timeout) {

        return {
            restrict: "A",
            link: function($scope, element, attr) {

                var timers  = [];
                var timeout = parseInt(attr.noCursor||3000);

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
                element.mousemove(function() {
                    showCursor();
                    timers.push($timeout(hideCursor, timeout));
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
