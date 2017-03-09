'use strict';
var app = angular.module('myApp',[]);

app.controller('mapController',function($scope, $http){
	$scope.datasets = []; //declare an empty array
	$http.get("models_mixed.json").success(function(response){ 
		$scope.datasets = response;  //ajax request to fetch data into $scope.data
		$scope.map;

		// read broswer size
		$scope.mapWidth = window.innerWidth;
		$scope.mapHeight = window.innerHeight;

		// initialize map
		$scope.rootCenter = [
          -87.6262909676922,
          41.88338213476951
        ];
		$scope.map = initMap($scope.rootCenter[1], $scope.rootCenter[0], $scope.map);
		
		// draw markers
		$scope.markers = [];
		loadMarker($scope.datasets, $scope.map);
	});
});


function loadMarker(datasets, map){
	var node;
	var i;
	for(i = 0; i < datasets.length; i ++){
		node = datasets[i];
		if(node.is_poi){
			drawMarker(map, node.lat, node.lon, node.name, "FE7569");
		}
		else{
			drawMarker(map, node.center[0], node.center[1], node.word, "2EFE2E")
			drawEllipse(map, node.center[0], node.center[1], node.var_x, node.var_y, node.rho);
		}
	}
}


function initMap(x, y, map){
	map = new google.maps.Map(document.getElementById('map'),{
		center: {lat: x, lng: y},
		zoom: 13
	});
	return map;
}

function drawMarker(map, lat, lng, name, color){
	var center = new google.maps.LatLng(lat, lng);
	var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + color);
	var marker = new google.maps.Marker({position: center, map: map, icon: pinImage});
	var mapLabel =  new MapLabel({
			text: name,
			position: center,
			map: map,
			fontSize: 16,
			align:'center'
		});
	marker.bindTo('map', mapLabel);
}

function drawEllipse(map, lat, lng, firstradius, secondradius, rho) {

        var center = new google.maps.LatLng(lat, lng);
      	var rho = 0.5
        var points = [];
        var Angle_ad;
        var Angle;
    for (var Angle=0; Angle<360; Angle+=10){
    	Angle_ad = Math.PI / 180 * rho
            var x = lat + firstradius*Math.cos(Angle*(Math.PI/180));
            var y = lng + secondradius*Math.sin(Angle*(Math.PI/180));
            var x_ = (x - lat) * Math.cos(45) - (y - lng) * Math.sin(45) + lat;
            var y_ = (x - lat) * Math.sin(45) + (y - lng) * Math.cos(45) + lng;
            var point = new google.maps.LatLng(x_,y_);
            points.push(point);
    }
       var diamond = new google.maps.Polygon({
                paths: points,
                strokeColor: "F45C5C",
                strokeOpacity: 0.9,
                strokeWeight: 1,
                fillColor: "923131",
                fillOpacity: 0.3,
                map: map
        });
}

