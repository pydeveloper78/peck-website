peckApp.directive('peckBird', ['ngAudio', '$compile', 'peck', function(ngAudio, $compile, peck) {
    return {
        scope: {
            peckUuid: '=',
            peckBubble: '=',
            peckCallback: '&'
        },
        transclude: true,
        link: function(scope, element) {
            scope.peckCount = 0;
            var sound = ngAudio.load("sounds/knock.wav");
            var animations = ["bounce", "shake", "rubberBand"];            
            var bubbleStyles=[
                {className: 'x1', removeTime: 14},
                {className: 'x2', removeTime: 18},
                {className: 'x3', removeTime: 19},
                {className: 'x4', removeTime: 17},
                {className: 'x5', removeTime: 9}
            ];
            var bubbleAreaId = 'bubblearea' + Date.now() + Math.random();
            element.after('<div class="bubble-area" id="' + bubbleAreaId + '"></div>');
            var bubbleArea = angular.element(document.getElementById(bubbleAreaId));

            var peckAction = function() {
                
                sound.play();

                    angular.forEach(animations, function(animation) {
                        element.removeClass(animation);
                    })
                    element.addClass(animations[scope.peckCount%animations.length]);

                    if(scope.peckBubble!=false) {
                        var bubbleId = 'bubble' + Date.now();
                        var bubbleStyle = bubbleStyles[Math.floor(Math.random() * 5)];                    
                        bubbleArea.append(
                            $compile(
                                '<div class="bubble ' + bubbleStyle.className + '" alivetime="'+bubbleStyle.removeTime+'" bubble id="' + bubbleId + '"></div>'
                            )(scope)
                        );
                    }
                
                scope.peckCount++;
                
                if (scope.peckUuid != null) {
                    if(peck.authToken != null) {
                        peck.peck(scope.peckUuid);
                    }
                } 
                
                if(scope.peckCallback) {
                    scope.peckCallback();
                }
            }

            scope.$on('RemoveBubble', function (event, bubbleID) {
                console.log('RemoveBubble : ' + bubbleID);
                angular.element(document.getElementById(bubbleID)).remove();
            });

            element.bind('click', function() {
                peckAction();
            });
            
            scope.$parent.dblTouchMe = function() {
                peckAction();
            };
        }
    }
}])
.directive('bubble', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        scope: {
        },
        link: function(scope, element, attrs) {
            var aliveTime = parseInt(attrs.alivetime);
            aliveTime *= 1000;
            $timeout(function () {
                scope.$emit('RemoveBubble', attrs.id);
            }, aliveTime);
        }
    }
}]);