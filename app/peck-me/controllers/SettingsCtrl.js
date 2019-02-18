peckMeModule.controller('SettingsController', function ($scope, $rootScope, peck, $state, $timeout) {

    $scope.message = "";
    $scope.error = "";

    if(peck.authToken == null) {
        $state.go('pm-intro');
    }else {
        peck.getMe().success(function (data, status, headers, config) {            
            $scope.me = data;
            console.log('me=', $scope.me);
        });
    }

    $scope.submitted = false;
    $scope.save = function() {        
        $scope.submitted = true;
        if(!$scope.settingsForm.$valid) return;
        peck.saveSettings($scope.me).success(function(data, status, headers, config){
            console.log('settings has been saved', data);
            $rootScope.$broadcast('profileChanged', data);
            $scope.message = "Settings Saved";
            $scope.error = "";
            $timeout(function() {
                $state.go('pm-account');
            }, 2000);
        }).error(function(data, status, headers, config) {
            console.log('settings haven\'t been saved', data, status);
            $scope.message = "";
            $scope.error = data;
        });
    }
    
});