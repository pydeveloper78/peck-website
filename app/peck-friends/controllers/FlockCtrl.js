peckFriendsModule.controller('FlockController', function ($rootScope, $scope, $stateParams, PubNub, peck) {

    var flockUuid = $stateParams.flock_uuid;
    peck.authToken = $stateParams.auth_token;

    console.log("flock " + flockUuid);

    $scope.selectedFlock = {};
    $scope.flocks = {};

    $scope.subscribe = function (flock) {

        var channel = flock.channelName;

        PubNub.ngSubscribe({
            channel: channel
        });

        PubNub.ngHistory({channel: channel, count: 500});

        $rootScope.$on(PubNub.ngMsgEv(channel), function (event, payload) {
            // payload contains message, channel, env...
            console.log('got a message event:', payload);

            var message = payload.message;
            message.channelName = channel;
            if ($scope.flocks[message.flockUuid]) {
                $scope.flocks[message.flockUuid].lastMessage = message;
                $scope.flocks[message.flockUuid].messages.push(message);
            }


        });
    };

    console.log("getting chat me " + peck.authToken);
    
    peck.getMe().success(function (data, status, headers, config) {
        $scope.user = data;
    });

    peck.getFlock(flockUuid).success(function (data, status, headers, config) {
        $scope.flocks[data.uuid] = data;
        $scope.flocks[data.uuid].messages = [];
        $scope.subscribe(data);
        $scope.selectedFlock = data;
    });

});