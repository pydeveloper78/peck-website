peckFriendsModule.controller('HomeController', function ($scope, $location, peck, PubNub) {

    console.log("starting home controller");

    $scope.peckMe = function (callbackFn, uuid) {
        callbackFn(uuid);
    };

    $scope.onReply = function (uuid) {
        var userUuids = [];

        userUuids.push(uuid);
        peck.createFlocks(null, userUuids).success(function (data, status, headers, config) {
            console.log('Created Flock:', data);
            $location.path('/my-flocks/' + data.uuid).replace();
        });
    };

    $scope.onAddToFlock = function (uuid) {
        $location.path('/add-flock/' + uuid).replace();
    }

    peck.getFriends().success(function (data, status, headers, config) {
        $scope.friends = [];

        for (i = 0; i < data.users.length; i++) {
            var user = data.users[i];
            user.avatarUrl = peck.avatarUrlForAvatarId(user.avatarId);
            user.timesince = moment(user.lastActiveDate).fromNow();
            user.pecks = [];
            $scope.friends.push(user);
        }

        console.log(data);

        peck.getMe().success(function (data, status, headers, config) {
            $scope.user = data;
            //if (!peck.listeningChannels[data.pecksChannelName]) {
            peck.listeningChannels[data.pecksChannelName] = true;
            $scope.$on(PubNub.ngMsgEv(data.pecksChannelName), function (event, payload) {
                // payload contains message, channel, env...
                console.log('got a local message event:', payload);

                for (i = 0; i < $scope.friends.length; i++) {
                    var friend = $scope.friends[i];
                    if (friend.uuid == payload.message.userUuid) {
                        friend.pecks.push(payload.message);
                        friend.timesince = moment().fromNow();
                    } else {
                        user.timesince = moment(user.lastActiveDate).fromNow();
                    }
                }

                $scope.$apply();
            });
            //}

            PubNub.ngHistory({channel: data.pecksChannelName, count: 500});
        });

    });
});