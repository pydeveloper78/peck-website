peckFriendsModule.controller('PeckMapController', function ($scope, peck) {

    $scope.$on('mapInitialized', function (event, map) {

        peck.getFriends().success(function (data, status, headers, config) {
            $scope.map.markers = [];

            var infowindow = new google.maps.InfoWindow({});

            for (i = 0; i < data.users.length; i++) {

                var user = data.users[i];
                user.avatarUrl = peck.avatarUrlForAvatarId(user.avatarId);
                user.timesince = moment(user.lastActiveDate).fromNow();
                user.pecks = [];
                //$scope.friends.push(user);


                var image = {
                    url: user.avatarUrl,
                    scaledSize: new google.maps.Size(60, 60)
                };

                if(user.location) {
                    var myLatLng = new google.maps.LatLng(user.location.coordinate.latitude, user.location.coordinate.longitude);
                    var friendMarker = new google.maps.Marker({
                        position: myLatLng,
                        map: $scope.map,
                        icon: image,
                        title: user.contact.firstName + " " + user.contact.lastName
                    });
                    console.log(friendMarker);
                    $scope.map.markers.push(friendMarker);

                    google.maps.event.addListener(friendMarker, 'click', function () {
                        infowindow.setOptions({
                            content: this.title
                        });
                        infowindow.open($scope.map, this);
                    });
                }
            }

            $scope.markerClusterer = new MarkerClusterer($scope.map, $scope.map.markers, {
                styles: [
                     {
                        url: '/images/marker_cluster.png',
                        height: 67,
                        width: 60,
                        anchor: [16, 0],
                        textColor: '#02BAD8',
                        textSize: 14
                    },
                    {
                        url: '/images/marker_cluster.png',
                        height: 67,
                        width: 60,
                        anchor: [24, 0],
                        textColor: '#FF9F00',
                        textSize: 14
                    }
                ]
            });

            //$scope.$apply();
        });
    });
});