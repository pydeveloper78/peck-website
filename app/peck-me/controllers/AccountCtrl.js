peckMeModule.controller('AccountController', function ($scope, $rootScope, $state, localStorageService, peck, PubNub) {

    $scope.pecks = [];

    peck.getMe().success(function (data, status, headers, config) {

        PubNub.ngSubscribe({
            channel: data.pecksChannelName
        });

        PubNub.ngHistory({channel: data.pecksChannelName, count: 100});

        $rootScope.$on(PubNub.ngMsgEv(data.pecksChannelName), function (event, payload) {
            // payload contains message, channel, env...
            var peckObj = payload.message;

            peck.getUser(peckObj.userUuid).success(function (data, status, headers, config) {                
                peckObj.name = data.contact.firstName + " " + data.contact.lastName;
                peckObj.avatarUrl = peck.avatarUrlForAvatarId(data.avatarId);
                peckObj.timesince = moment(peckObj.date).fromNow()
                if($scope.pecks.length == 0){
                    peckObj.count = 1;
                    $scope.pecks.push(peckObj);
                } else {
                    for(i=$scope.pecks.length-1; i>=0; i--) {
                        if($scope.pecks[i].name == peckObj.name && $scope.pecks[i].location.name == peckObj.location.name && $scope.pecks[i].timesince == peckObj.timesince) {
                            $scope.pecks[i].count = $scope.pecks[i].count + 1;
                            break;
                        }
                    }
                    if(i==-1) {
                        peckObj.count = 1;
                        $scope.pecks.push(peckObj);
                    }
                }
            });
            
            $scope.$apply();
        });
    });
});

peckMeModule.controller('PecksController', function ($scope, peck) {

    $scope.peckMe = function(callbackFn) {
        if (peck.authToken != null) {
            callbackFn();
            peck.peck($scope.peck.userUuid);
        } else {
            $scope.animation = "shake";
        }
    }

});