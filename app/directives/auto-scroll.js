import angular from 'angular';
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
                var paused = false;
                var lastScrollTop = 0;
                var playButton = null;

                if(($scope.autoScroll||{}).pausable && ($scope.autoScroll||{}).orientation == 'y')
                    container.on('scroll', onScroll);

                //==================================================
                //
                //==================================================
                $scope.$watch('autoScrollOn', function (on) {

                    clearTimers();
                    resume(false);

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
                    container.off('scroll', onScroll);
                    hidePlayButton();
                });

                //==================================================
                // user scrolled backward: pause auto-scroll until play is pressed
                //==================================================
                function onScroll() {

                    var scrollTop = container.scrollTop();

                    if(!paused && $scope.autoScrollOn && scrollTop < lastScrollTop - 2)
                        pause();

                    lastScrollTop = scrollTop;
                }

                //==================================================
                //
                //==================================================
                function pause() {
                    paused = true;
                    clearTimers();
                    showPlayButton();
                }

                //==================================================
                //
                //==================================================
                function resume(restart) {

                    paused = false;
                    hidePlayButton();

                    if(restart) {
                        lastScrollTop = container.scrollTop();
                        startAutoScroll();
                    }
                }

                //==================================================
                //
                //==================================================
                function showPlayButton() {

                    if(playButton)
                        return;

                    var footer = angular.element('footer');
                    var bottom = Math.max(window.innerHeight - container[0].getBoundingClientRect().bottom, footer.outerHeight() || 0) + 16;

                    playButton = angular.element('<button type="button" class="btn btn-primary auto-scroll-play" title="Resume"><i class="fa fa-play"></i></button>');
                    playButton.css('bottom', bottom+'px');
                    playButton.on('click', function() {
                        $scope.$apply(function() { resume(true); });
                    });

                    angular.element(document.body).append(playButton);
                }

                //==================================================
                //
                //==================================================
                function hidePlayButton() {

                    if(playButton)
                        playButton.remove();

                    playButton = null;
                }

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
