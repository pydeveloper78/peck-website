peckApp.factory('peck', ['$rootScope', '$http', '$location', 'peck_config', 'PubNub', 'localStorageService', function ($rootScope, $http, $location, peck_config, PubNub, localStorageService) {
        var absUrl = $location.absUrl();
        var pathParts = absUrl.split("/");
        var flockUuid = pathParts[5];

        var peck = {};
        peck.authToken = localStorageService.get("peck.authToken");
        //peck.authToken = "0663a146cef0abc8618d9241762be3641a5f0e54"; // for test

        var server = "http://qa.peck.me:8080";
        //var server = "http://localhost:8080";

        console.log("user " + peck.authToken);


        peck.listeningChannels = {};
        /*
         mixpanel.init(peck_config.mixpanel_token);
         mixpanel.register({
         app_type: "Web"
         });
         mixpanel.identify(userUuid);
         mixpanel.track("ViewScreen", {screen: "Web Chat"});
         mixpanel.track("OpenApp");*/

        PubNub.init({
            publish_key: peck_config.publish_key,
            subscribe_key: peck_config.subscribe_key
        });

        peck.peck = function (uuid) {
            var req = {
                method: 'POST',
                url: server + '/api/v5/users/' + uuid + "/pecks",
                headers: {
                    'X-Auth-Token': peck.authToken,
                    'Content-Type': "application/json"
                },
                data: {}
            };
            return $http(req);
        };

        peck.getPecks = function(uuid) {
            var req = {
                method: 'GET',
                url: server + '/api/v5/users/' + uuid + "/pecks",
                headers: {
                    'X-Auth-Token': peck.authToken
                },
                data: {}
            };
            return $http(req);
        }

        peck.getUserFromDigits = function (url, headers) {
            var req = {
                method: 'POST',
                url: server + '/auth/digits',
                headers: {
                    'Content-Type': "application/json"
                },
                data: {
                    url: url,
                    headers: headers
                }
            };
            return $http(req);
        };

        peck.getUser = function (uuid) {
            var req = {
                method: 'GET',
                cache: true,
                url: server + '/api/v5/users/' + uuid,
                headers: {
                    'X-Auth-Token': peck.authToken
                }
            };
            return $http(req);
        };

        peck.findUser = function (username) {
            var req = {
                method: 'GET',
                url: server + '/api/v5/users/find?query=' + username
            };
            return $http(req);
        };

        peck.getMe = function () {
            var req = {
                method: 'GET',
                cache: true,
                url: server + '/api/v5/users',
                headers: {
                    'X-Auth-Token': peck.authToken
                }
            };
            return $http(req);
        };
        peck.getFriends = function () {
            var req = {
                method: 'GET',
                cache: true,
                url: server + '/api/v5/users/friends',
                headers: {
                    'X-Auth-Token': peck.authToken
                }
            };
            return $http(req);
        };
        peck.getFlock = function (flockUuid) {
            var req = {
                method: 'GET',
                cache: true,
                url: server + '/api/v5/flocks/' + flockUuid,
                headers: {
                    'X-Auth-Token': peck.authToken
                }
            };
            return $http(req);
        };
        peck.getFlocks = function () {
            var req = {
                method: 'GET',
                //cache: true,
                url: server + '/api/v5/flocks',
                headers: {
                    'X-Auth-Token': peck.authToken
                }
            };
            return $http(req);
        };
        peck.createFlocks = function (emailContacts, userUuids) {
            var data = {
                emailContacts: emailContacts,
                userUuids: userUuids
            };
            var req = {
                method: 'POST',
                url: server + '/api/v5/flocks',
                headers: {
                    'X-Auth-Token': peck.authToken
                },
                data: data
            };
            return $http(req);
        };
        peck.addToFlock = function (flockId, userUuids) {
            var data = {
                userUuids: userUuids
            };
            var req = {
                method: 'POST',
                url: server + '/api/v5/flocks/' + flockId + '/users',
                headers: {
                    'X-Auth-Token': peck.authToken
                },
                data: data
            };
            return $http(req);
        };
        peck.updateFlocks = function (flock) {
            var id = flock.uuid;
            var data = {
                muted: flock.muted,
                name: flock.name
            };
            var req = {
                method: 'PUT',
                url: server + '/api/v5/flocks/' + id,
                headers: {
                    'X-Auth-Token': peck.authToken
                },
                data: data
            };
            return $http(req);
        };
        peck.deleteFlocks = function (fid, uid) {
            var req = {
                method: 'DELETE',
                url: server + '/api/v5/flocks/' + fid + '/users/' + uid,
                headers: {
                    'X-Auth-Token': peck.authToken
                }
            };
            return $http(req);
        };
        peck.getStack = function (stackUuid) {
            var req = {
                method: 'GET',
                cache: true,
                url: server + '/api/v5/stacks/' + stackUuid,
                headers: {
                    'X-Auth-Token': peck.authToken
                }
            };
            return $http(req);
        };
        peck.avatarUrlForAvatarId = function (avatarId) {
            var zp = ("000" + avatarId).substr(-3, 3);
            return "http://www.peck.me/chat/birds/bird_" + zp + "@2x.png";
        };

        peck.editMyProfile = function (me) {

            console.log(me);
            var data = {
                "contact": {
                    "emailAddresses": me.contact.emailAdddresses == null ? null : [me.contact.emailAddresses],
                    "firstName": me.contact.firstName,
                    "lastName": me.contact.lastName
                },
                "avatarId": me.avatarId
            };
            var req = {
                method: 'PUT',
                url: server + '/api/v5/users',
                headers: {
                    'X-Auth-Token': peck.authToken,
                    'Content-Type': "application/json"
                },
                data: data
            };
            return $http(req);
        }


        peck.saveSettings = function (settings) {
            var user = {
                "contact": {
                    "emailAddresses": settings.contact.emailAdddresses == null ? null : [settings.contact.emailAddresses],
                    "firstName": settings.contact.firstName,
                    "lastName": settings.contact.lastName
                },
                "username": settings.username
            };
            var req = {
                method: 'PUT',
                url: server + '/api/v5/users',
                headers: {
                    'Content-Type': "application/json",
                    'X-Auth-Token': peck.authToken
                },
                transformResponse: function (data) {
                    try {
                        return JSON.parse(data);
                    } catch (e) {
                        return data;
                    }
                },
                data: user
            };
            return $http(req);
        }



        return peck;
    }]);