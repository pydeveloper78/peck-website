peckMeModule.controller('IntroController', function ($scope) {
    $scope.pecks = 0;
    $scope.callbackForIntro = function() {
        $scope.pecks++;
    }
});