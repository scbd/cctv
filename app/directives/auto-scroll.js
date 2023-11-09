import app from '~/app';

    app.directive('autoScroll', ['$timeout', function($timeout) {

        return {
            restrict: "A",
            scope: {
                autoScroll: '=',
                autoScrollOn: '=',
                autoScrollCompleteFn: '&autoScrollComplete'
            },
            link: function($scope, element) {

                var container = element.parent();
                var timers = [];

                //==================================================
                //
                //==================================================
                $scope.$watch('autoScrollOn', function (on) {

                    clearTimers();

                    if (!on)
                        return;

                    var options = $scope.autoScroll;

                    if(options.autoReset) {
                        container.scrollTop(0);
                        container.scrollLeft(0);
                    }

                    timers.push($timeout(startAutoScroll, options.open || 2000));
                });

                //==================================================
                //
                //==================================================
                function startAutoScroll()
                {
                    var options = $scope.autoScroll;

                    var timing;

                    if (options.orientation == 'y') {

                        var scrollTop = Math.max(Math.max(element.outerHeight() - container.height(), 0) - container.scrollTop(),0);

                        timing = computeTiming(options, scrollTop);

                        if (scrollTop>0) {
                            container.animate({ scrollTop: scrollTop }, { duration: timing.scroll, easing: 'linear' });
                        }
                    }

                    if (options.orientation == 'x') {

                        var scrollLeft = Math.max(Math.max(element.outerWidth() - container.width(), 0) - container.scrollLeft(),0);

                        timing = computeTiming(options, scrollLeft);

                        if (scrollLeft>0) {
                            container.animate({ scrollLeft: scrollLeft }, { duration: timing.scroll, easing: 'linear' });
                        }
                    }

                    timers.push($timeout(completed, timing.scroll+timing.close));
                }

                //==================================================
                //
                //==================================================
                function computeTiming(options, delta) {

                    var open  = options.open    || 2000;
                    var close = options.close   || 2000;
                    var min   = options.timeout || 10000;

                    var scroll = 0;

                    if(options.speed>0) { // px/sec;
                        scroll = (delta*1000 / options.speed)|0; // force int
                    }

                    scroll = Math.max(scroll, min-open-close);

                    return {
                        open : open,
                        close : close,
                        scroll : scroll
                    };
                }

                //==================================================
                //
                //==================================================
                function completed() {
                    clearTimers();
                    $scope.autoScrollCompleteFn();
                }

                //==================================================
                //
                //==================================================
                $scope.$on('$destroy', function(){
                    clearTimers();
                });

                //==================================================
                //
                //==================================================
                function clearTimers() {

                    container.stop();

                    while(timers.length)
                        $timeout.cancel(timers.shift());
                }
            }
        };
    }]);
