navbarModule.controller('NavbarController', function ($scope, peck, Digits, localStorageService, $state, $rootScope, $auth, $location) {
    $scope.user = null;
    $scope.isCollapsed = true;
    $scope.currentNav = 'me';

    if (peck.authToken != null) {
        console.log("getting me " + peck.authToken);
        peck.getMe().success(function (data, status, headers, config) {
            $scope.user = data;
            $scope.user.avatarUrl = peck.avatarUrlForAvatarId(data.avatarId);
        });
    }

    $scope.$watch("peck.authToken", function () {

        if (peck.authToken == null) {
            $scope.user = null;
        } else {
            console.log("getting me " + peck.authToken);
            peck.getMe().success(function (data, status, headers, config) {
                $scope.user = data;
                $scope.user.avatarUrl = peck.avatarUrlForAvatarId(data.avatarId);
            });
        }

    })

    $scope.login = function () {
        console.log("login click");

        var userData = {redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host};


        $auth.authenticate('twitter', userData).then(function (response) {
            // Signed In.

            var token = response.data.token;


            localStorageService.set("peck.authToken", token);
            peck.authToken = token;
            $scope.showSignin = false;


            peck.getMe().success(function (data, status, headers, config) {
                if (!$state.is('pm-profile')) {
                    console.log("logged in state "+$state.$current.name);
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

        });

        /*
         Digits.login().then(function (loggedInResponse) {
         // successfully authenticated
         console.log('Authorization headers', loggedInResponse.getOAuthHeaders());
         
         $scope.$applyAsync(function () {
         peck.getUserFromDigits(loggedInResponse.getOAuthHeaders().url, loggedInResponse.getOAuthHeaders().authorization).success(function (data, status, headers, config) {
         
         vat token = data.token;
         
         localStorageService.set("peck.authToken", token);
         peck.authToken = token;
         $scope.showSignin = false;
         
         
         peck.getMe().success(function (data, status, headers, config) {
         
         if (data.username !== undefined) {
         $scope.user = data;
         $scope.user.avatarUrl = peck.avatarUrlForAvatarId(data.avatarId);
         console.log("authenticated user: " + token.token + " " + $scope.user.avatarUrl);
         $rootScope.$broadcast('user_updated');
         if (!$state.is('pm-profile')) {
         $state.go('pm-account');
         }
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
         });*/
    };

    $scope.logout = function () {
        localStorageService.remove("peck.authToken");
        peck.authToken = null;
        $rootScope.$broadcast('user_updated');
        $scope.user = null;
        $state.go('pm-intro');
    };

    $scope.$on('profileChanged', function (event, args) {
        console.log("Profile changed fired", args);
        $scope.user = args;
        $scope.user.avatarUrl = peck.avatarUrlForAvatarId(args.avatarId);
    });

    $scope.clickedTopNav = function (mode) {
        $scope.currentNav = mode;
    };
});
