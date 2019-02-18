peckFriendsModule.controller('FriendProfileController', function ($stateParams, $scope, peck, Digits, localStorageService, PubNub, $location, $rootScope, $auth) {
    $scope.pecks = [];

    peck.getMe().success(function(data) {
        $scope.me = data
    });

    peck.getUser($stateParams.uuid).success(function(data, status, headers, config) {        
        $scope.friend = data;
        $scope.friend.avatarUrl = peck.avatarUrlForAvatarId($scope.friend.avatarId);

        peck.getPecks($scope.friend.uuid).success(function(data) {
            $scope.pecks = [];            
            _.each(data.pecks, function(dpeck) {
                dpeck.timesince = moment(dpeck.date).fromNow();                
                cpeck = _.find($scope.pecks, function(pck) {
                    return dpeck.location.name == pck.location.name && dpeck.timesince == pck.timesince;
                })
                if(cpeck) {
                    cpeck.count ++;
                } else {
                    dpeck.count = 1;
                    $scope.pecks.push(dpeck);
                }
            });            
        })
    });

    $scope.reply = function() {
        if(!$scope.me || !$scope.friend) return;

        var userUuids = [];
        userUuids.push($scope.friend.uuid);
        peck.createFlocks(null, userUuids).success(function (data, status, headers, config) {
            $location.path('/my-flocks/' + data.uuid).replace();
        });
    }

    $scope.addToFlock = function() {
        if(!$scope.me || !$scope.friend) return;

        $location.path('/add-flock/' + $scope.friend.uuid).replace();
    }
});


