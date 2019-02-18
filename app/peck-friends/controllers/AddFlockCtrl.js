peckFriendsModule.controller('AddFlockController', function ($rootScope, $scope, $location, $stateParams, peck, PubNub) {

    console.log("starting add flock controller");

    $scope.flocks = {};
    $scope.selectedFlock = {};
    $scope.users_name = {};

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

    $scope.getUsersName = function(uuid) {

        peck.getFlock(uuid).success(function (gdata, status, headers, config) {

            var userUuids = gdata.userUuids;
            var users_name = '';
            var inx = 0;

            for (var i = 0; i < userUuids.length; i++) {
                peck.getUser(userUuids[i]).success(function (data, status, headers, config) {
                    if(inx < userUuids.length-1)
                        users_name += data.contact.firstName + ' ' + data.contact.lastName + ', ';
                    else
                        users_name += data.contact.firstName + ' ' + data.contact.lastName;

                    $scope.users_name[uuid] = users_name;

                    inx++;
                });
            }

        });
    };

    $scope.isActive = function (flock) {
        if ($scope.selectedFlock.uuid == flock.uuid) {
            return true;
        } else {
            return false;
        }
    };

    $scope.selectFlock = function (flock) {
        console.log("clicked " + flock.uuid);

        $scope.selectedFlock = flock;
    };

    $scope.onAddToFlock = function () {
        var flockId = $scope.selectedFlock.uuid;
        var userUuids = [];

        userUuids.push($stateParams.friend_id);

        peck.addToFlock(flockId, userUuids).success(function (data, status, headers, config) {
            $location.path('/my-flocks/').replace();
        });
    };

    $scope.onCancel = function () {
        $location.path('/my-home').replace();
    }

    peck.getFlocks().success(function (data, status, headers, config) {
        for (i = 0; i < data.flocks.length; i++) {
            console.log("subscribing to " + data.flocks[i].channelName);
            $scope.flocks[data.flocks[i].uuid] = data.flocks[i];
            $scope.flocks[data.flocks[i].uuid].messages = [];
            $scope.subscribe(data.flocks[i]);
            $scope.getUsersName(data.flocks[i].uuid);
        }
        console.log("selecting flock " + data.flocks[0].uuid);
        $scope.selectedFlock = data.flocks[0];
    });

});