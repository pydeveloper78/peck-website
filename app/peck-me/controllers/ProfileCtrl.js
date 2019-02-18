peckMeModule.controller('ProfileController', function ($stateParams, $scope, peck, Digits, localStorageService, PubNub, $state, $rootScope, $auth) {
    $scope.username = $stateParams.peck_username;
    $scope.showSignin = false;
    $scope.authedUser = null;
    $scope.userpecks = [];

    var updateSigninStatus = function () {
        if (peck.authToken != null) {
            peck.getMe().success(function (data, status, headers, config) {
                $scope.authedUser = data;
            });
        }
    }
    updateSigninStatus();
    $scope.$on('user_updated', function () {
        updateSigninStatus();
    })

    peck.findUser($stateParams.peck_username).success(function (data, status, headers, config) {

        data.avatarUrl = peck.avatarUrlForAvatarId(data.avatarId);
        $scope.user = data;
    });


    $scope.pecks = 0;
    $scope.callbackForPeckUser = function () {
        if ($scope.authedUser) {
            $scope.pecks++;
        } else {
            $scope.showSignin = true;
        }
    }

    $scope.login = function () {
        console.log("login click");

        $auth.authenticate('twitter').then(function (response) {
            var token = response.data.token;

            console.log("logged in on state "+$state.get());

            localStorageService.set("peck.authToken", token);
            peck.authToken = token;
            $scope.showSignin = false;


            peck.getMe().success(function (data, status, headers, config) {
                if (!$state.is('pm-profile')) {
                    if (data.username !== undefined) {
                        $scope.user = data;
                        $scope.user.avatarUrl = peck.avatarUrlForAvatarId(data.avatarId);
                        console.log("authenticated user: " + token + " " + $scope.user.avatarUrl);
                        $rootScope.$broadcast('user_updated');

                        $state.go('pm-account');

                    } else {
                        $state.go('pm-settings');
                    }
                }
            });

        }).catch(function (loginError) {
            if (loginError.wasPopupBlocked()) {
                // popup was blocked
            } else if (loginError.wasWindowClosed()) {
                // window was closed
            } else {
                // a problem with authentication occured
            }

        });
        /*
         Digits.login().then(function (loggedInResponse) {
         // successfully authenticated
         console.log('Authorization headers', loggedInResponse.getOAuthHeaders());
         
         $scope.$applyAsync(function () {
         peck.getUserFromDigits(loggedInResponse.getOAuthHeaders().url, loggedInResponse.getOAuthHeaders().authorization).success(function (token, status, headers, config) {
         
         localStorageService.set("peck.authToken", token.token);
         peck.authToken = token.token;
         $scope.showSignin = false;
         peck.getMe().success(function (data, status, headers, config) {
         
         if (data.username !== undefined) {
         $scope.authedUser = data;
         $scope.authedUser.avatarUrl = peck.avatarUrlForAvatarId(data.avatarId);
         console.log("authenticated user: " + token.token + " " + $scope.authedUser.avatarUrl);
         $rootScope.$broadcast('profileChanged', data);  
         } else {
         $state.go('pm-settings');
         }
         });
         });
         });
         
         }).catch(function (loginError) {
         if (loginError.wasPopupBlocked()) {
         // popup was blocked
         } else if (error.wasWindowClosed()) {
         // window was closed
         } else {
         // a problem with authentication occured
         }
         });
         */
    };

});