var peckApp = angular.module('PeckApp', ['ui.router',
    'peck.config',
    'atticoos.digits',
    'LocalStorageModule',
    "pubnub.angular.service",
    'navbarModule',
    'angular-gestures',
    'satellizer',
    'peckFriendsModule',
    'peckMeModule']);

peckApp.config(function ($stateProvider, $urlRouterProvider, DigitsProvider, hammerDefaultOptsProvider, $authProvider) {

    DigitsProvider.setConsumerKey('6B7cmRDDcAn74iRQlLEuSsBfx');

    $authProvider.twitter({
        clientId: '6B7cmRDDcAn74iRQlLEuSsBfx',
        url:  'http://qa.peck.me:8080/auth/twitter'
    });

    $urlRouterProvider.otherwise('/');
//$locationProvider.html5Mode(true);
    $stateProvider

            /*
             * PECK FRIENDS STATES
             * 
             * This is for the private messaging component
             * 
             */

            .state('pf-home', {
                url: '/my-home',
                templateUrl: 'partials/partial-pf-home.html',
                controller: 'HomeController'
            })

            .state('pf-add-flock', {
                url: '/add-flock/{friend_id}',
                templateUrl: 'partials/partial-pf-add-flock.html',
                controller: 'AddFlockController'
            })

            .state('pf-flocks', {
                url: '/my-flocks/{flock_id}',
                templateUrl: 'partials/partial-pf-flocks.html',
                controller: 'FlocksController'
            })

            .state('pf-flock', {
                url: '/share/{flock_uuid}/{auth_token}',
                templateUrl: 'partials/partial-pf-flock.html',
                controller: 'FlockController'
            })

            .state('pf-map', {
                url: '/my-map',
                templateUrl: 'partials/partial-pf-map.html',
                controller: 'PeckMapController'
            })

            .state('pf-you', {
                url: '/my-profile',
                templateUrl: 'partials/partial-pf-you.html',
                controller: 'MyProfileController'
            })
            
            .state('pf-profile', {
                url: '/friends/{uuid}',
                templateUrl: 'partials/partial-pf-profile.html',
                controller: 'FriendProfileController'
            })
            
            /*
             * PECK ME STATES
             * 
             * This is for the public-facing component
             * 
             */

            .state('pm-profile', {
                url: '/~{peck_username}',
                templateUrl: 'partials/partial-pm-profile.html',
                controller: 'ProfileController'
            })

            .state('pm-settings', {
                url: '/settings',
                templateUrl: 'partials/partial-pm-settings.html',
                controller: 'SettingsController'
            })
            
            .state('pm-intro', {
                url: '/',
                templateUrl: 'partials/partial-pm-intro.html',
                controller: 'IntroController'
            })

            .state('pm-account', {
                url: '/pecks',
                templateUrl: 'partials/partial-pm-account.html',
                controller: 'AccountController'
            })

    hammerDefaultOptsProvider.set({
        recognizers: [[Hammer.Tap, {event: 'doubletap', taps: 2, stopPropagation: true}]]
    });


});

var peckFriendsModule = angular.module('peckFriendsModule', ['ngTouch', 'peck.config', "pubnub.angular.service", 'ngAudio', 'ngMap', 'satellizer', 'atticoos.digits', 'angularMoment']);
var peckMeModule = angular.module('peckMeModule', ['ngTouch', 'peck.config', 'satellizer', 'atticoos.digits', 'angularMoment']);
var navbarModule = angular.module('navbarModule', ['ngTouch', 'peck.config', 'satellizer', 'atticoos.digits', 'LocalStorageModule', 'ui.bootstrap']);
