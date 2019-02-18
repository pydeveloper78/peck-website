peckFriendsModule.controller('FlocksController', function ($rootScope, $scope, $stateParams, PubNub, peck) {

    $scope.selectedFlock = {};

    //$scope.allMessages = [];

    $scope.flocks = {};

    $scope.users_name = {};

    $scope.emptyFlocks = true;

    $scope.peckMe = function (callbackFn) {
        callbackFn();
    }

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
                $scope.flocks[message.flockUuid].lastMessage.timesince = moment(message.dateSent).fromNow();
                $scope.flocks[message.flockUuid].messages.unshift(message);
                $scope.$apply();
            }


        });
    };

    console.log("getting chat me " + peck.authToken);
    peck.getMe().success(function (data, status, headers, config) {
        $scope.user = data;
    });

    peck.getFlocks().success(function (data, status, headers, config) {
        //$scope.flocks = data.flocks;

        if(data.flocks.length != 0) {
            $scope.emptyFlocks = false;
            for (i = 0; i < data.flocks.length; i++) {
                console.log("subscribing to " + data.flocks[i].channelName);
                $scope.flocks[data.flocks[i].uuid] = data.flocks[i];
                $scope.flocks[data.flocks[i].uuid].messages = [];
                $scope.subscribe(data.flocks[i]);
                getUsersName(data.flocks[i].uuid);
            }
            console.log("selecting flock " + data.flocks[0].uuid);
            if($stateParams.flock_id) {
                $scope.selectedFlock = $scope.flocks[$stateParams.flock_id];
            } else {
                $scope.selectedFlock = data.flocks[0];
            }
        }


    });

    var getUsersName = function (uuid) {

        peck.getFlock(uuid).success(function (gdata, status, headers, config) {

            var userUuids = gdata.userUuids;
            var users_name = '';
            var inx = 0;

            for (var i = 0; i < userUuids.length; i++) {
                peck.getUser(userUuids[i]).success(function (data, status, headers, config) {
                    if (inx < userUuids.length - 1)
                        users_name += data.contact.firstName + ', ';
                    else
                        users_name += data.contact.firstName;

                    $scope.users_name[uuid] = users_name;

                    inx++;
                });
            }

        });
    }

});

peckFriendsModule.controller('FlockListController', function ($scope, peck) {


    $scope.selectFlock = function (flock) {
        console.log("clicked " + flock.uuid);

        $scope.$parent.selectedFlock = flock;
    };

    $scope.isActive = function (flock) {
        if ($scope.$parent.selectedFlock.uuid == flock.uuid) {
            return true;
        } else {
            return false;
        }
    }

});

peckFriendsModule.controller('UserListController', function ($scope, peck) {

    $scope.$parent.$watch('selectedFlock', function (value) {
        if (value.uuid) {
            value.hasUnread = false;
            peck.getFlock(value.uuid).success(function (gdata, status, headers, config) {

                var userUuids = gdata.userUuids;

                $scope.users = [];
                $scope.users_name = '';

                for (i = 0; i < userUuids.length; i++) {

                    peck.getUser(userUuids[i]).success(function (data, status, headers, config) {
                        var user = data;
                        user.avatarUrl = peck.avatarUrlForAvatarId(data.avatarId);
                        $scope.users.push(user);
                    });
                }

            });
        }
    });

    $scope.muteFlock = function () {
        $scope.$parent.selectedFlock.muted = true;
        peck.updateFlocks($scope.$parent.selectedFlock).success(function (data, status, headers, config) {
            console.log(data);
        });
    }

    $scope.leaveFlock = function () {
        var fid = $scope.$parent.selectedFlock.uuid;
        //var uid = $scope.$parent.selectedFlock.ownerUuid;
        peck.getMe().success(function (meData, status, headers, config) {
            peck.deleteFlocks(fid, meData.uuid).success(function (data, status, headers, config) {
                console.log(data);
            });
        });
    }


});

peckFriendsModule.controller('MessageController', function ($scope, peck) {
    peck.getUser($scope.$parent.message.userUuid).success(function (data, status, headers, config) {
        var user = data;
        user.avatarUrl = peck.avatarUrlForAvatarId(data.avatarId);
        $scope.message.user = user;
    });

    $scope.message = $scope.$parent.message;
});

peckFriendsModule.controller('StackController', function ($scope, peck) {
    $scope.slides = [];
    $scope.server = "http://qa.peck.me:8080/";
    console.log("retrieving stack " + $scope.$parent.message.stackUuid);
    peck.getStack($scope.$parent.message.stackUuid).success(function (data, status, headers, config) {
        var stack = data;
        $scope.stack = stack;
        for (i = 0; i < stack.assets.length; i++) {
            var asset = stack.assets[i];
            if (i == 0) {
                asset.active = true;
            } else {
                asset.active = false;
            }
            $scope.slides.push(asset);
        }
    });
});

peckFriendsModule.controller('ChatController', function ($rootScope, $scope, $document, PubNub, peck) {

    $scope.messages = [];
    $scope.editableTitle = false;

    $scope.$parent.$watch('selectedFlock', function (flock) {
        if (flock.uuid) {
            $scope.messages = $scope.$parent.flocks[flock.uuid].messages;
            console.log("selected " + flock.channelName + " > " + flock.uuid);

            $scope.flock = flock;

        }
    });

    $scope.changeEditable = function () {
        $scope.editableTitle = true;
    }

    $scope.cancelEditable = function () {
        $scope.editableTitle = false;
    }

    $scope.changeTitle = function () {
        $scope.editableTitle = false;
        peck.updateFlocks($scope.flock).success(function (data, status, headers, config) {
            console.log(data);
        });
    }

    $scope.publish = function () {
        console.log('publish', $scope);
        var text = $scope.newMessage;
        var payload = {};
        payload.messageText = text;
        payload.dateSent = new Date();
        payload.flockUuid = $scope.$parent.selectedFlock.uuid;
        payload.userUuid = $scope.user.uuid;
        var apns = {};
        apns.aps = {};
        apns.aps.alert = $scope.user.contact.firstName + ": " + text;
        apns.aps.sound = "single-knock.m4a";
        apns.peck = {};
        apns.peck.flockUuid = $scope.$parent.selectedFlock.uuid;
        payload.pn_apns = apns;
        payload.type = "message";
        PubNub.ngPublish({
            channel: $scope.$parent.selectedFlock.channelName,
            message: payload
        });
        //mixpanel.track("SendMessage", {type: "Comment"});
        return $scope.newMessage = '';
    };
});