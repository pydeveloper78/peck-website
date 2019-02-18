peckFriendsModule.controller('MyProfileController', function ($scope, $rootScope, peck) {

    console.log("starting my profile controller");

    $scope.me = [];

    peck.getMe().success(function (data, status, headers, config) {
        $scope.me = data;
        $scope.me.avatarUrl = peck.avatarUrlForAvatarId(data.avatarId);
        $rootScope.$broadcast('profileChanged', $scope.me);
    });

    $scope.editMyProfile = function() {
        peck.editMyProfile($scope.me).success(function(data, status, headers, config){
            console.log('Editing my profile success: ', data);
        }).error(function(data, status, headers, config) {
            console.log('Editing my profile error: ', data);
        });
    };

    $scope.changeAvatar = function() {
        var avatarId = $scope.me.avatarId;
        $scope.me.avatarId = ($scope.me.avatarId + 1) % 17;
        $scope.me.avatarUrl = peck.avatarUrlForAvatarId($scope.me.avatarId);
    }

});