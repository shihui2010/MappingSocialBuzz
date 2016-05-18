'use strict';
var app = angular.module('myApp',[]);

app.controller('mapController',function($scope, $http){
	$scope.datasets = []; //declare an empty array
	$http.get("model.json").success(function(response){ 
		$scope.datasets = response;  //ajax request to fetch data into $scope.data
		$scope.map;

		// initialize map
		$scope.rootCenter = [];
		$scope.rootCenter = $scope.datasets.features[0].properties.center;
		$scope.map = initMap($scope.rootCenter[1], $scope.rootCenter[0], $scope.map);
		
		// draw markers
		$scope.markers = [];
		var zoomLevel = $scope.map.getZoom();
		$scope.markers = initLoadMarker($scope.datasets, $scope.map);
		// $scope.heatmapLayers = loadMarker($scope.datasets, $scope.map, $scope.heatmapLayers, zoomLevel);
		
		// zoom listener
		$scope.map.addListener('zoom_changed', function(){
			zoomLevel = $scope.map.getZoom();
			$scope.markers = loadMarker($scope.markers, $scope.datasets, $scope.map, zoomLevel);
		});
	});
});


function initLoadMarker(datasets, map){
	return loadMarker([], datasets, map, 13);
}


function loadMarker(markers, datasets, map, zoomLevel){
	// clear exiting markers
	var i;
	for(i = 0; i < markers.length; i ++){
		markers[i].setMap(null);
	}
	markers = [];
	// render new markers
	var mapLabel;
	var node;
	var marker;
	var modelLevel;
	var targetLevel;
	if(zoomLevel < 12)
		return;
	if(zoomLevel < 14)
		targetLevel = 1;
	else if(zoomLevel < 16)
		targetLevel = 2;
	else if(zoomLevel < 19)
		targetLevel = 3;
	for(i = 0; i < datasets.features.length; i ++){
		node = datasets.features[i].properties;
		modelLevel = node.level;
		if(modelLevel == targetLevel){
			mapLabel =  new MapLabel({
				text: node.top_words[0] + ',' + node.top_words[1] + ',' + node.top_words[2],
				position: new google.maps.LatLng(node.center[1], node.center[0]),
				map: map,
				fontSize: Math.log10(node.num_documents) + 10,
				align:'center'
			});
			marker = new google.maps.Marker();
			marker.bindTo('map', mapLabel);
			marker.bindTo('position', mapLabel);
			marker.setDraggable(false);
			var infowindow = new google.maps.InfoWindow();
			var content = contentString(node);
			console.log(content);
			bindInfoWindow(marker, map, infowindow, content);
			markers.push(marker);
		}
	}
	return markers;
}

function bindInfoWindow(marker, map, infowindow, content){
	marker.addListener('click',function(){
		infowindow.setContent(content);
		infowindow.open(map, this);
	});
}

function contentString(node){
	var str = '<p>Level: ' + node.level.toString() + '</p>' + '<p>Top Words: ';
	var i;
	for(i = 0; i < node.top_words.length; i ++){
		str += node.top_words[i] + ' ';
	}
	str += '</p><p>Num of Documents: ' + node.num_documents.toString() + '</p>';
	return str;
}


// function loadMarker(datasets, map, heatmapLayers, zoomLevel){
// 	var node;
// 	var heatmap;
// 	var i;
// 	var radius;
// 	for(i = 0; i < datasets.features.length; i ++){
// 		var marker = [];
// 		node = datasets.features[i].properties;
// 		var modelLevel = node.level;
// 		marker.push(new google.maps.LatLng(node.center[1], node.center[0]));
// 		radius = Math.sqrt(node.deviation[0] * node.deviation[1]) * 5000* modelLevel;
// 		if(zoomLevel < 15 && modelLevel == 1)
// 			heatmapLayers.push(drawMarker(marker, map, radius));
// 		else if(14 < zoomLevel < 17 && modelLevel == 2)
// 			heatmapLayers.push(drawMarker(marker, map, radius));
// 		else if(16 < zoomLevel < 19 && modelLevel == 3)
// 			heatmapLayers.push(drawMarker(marker, map, radius));
// 	}
// 	return heatmapLayers;
// }

// function drawMarker(marker, map, radius){
// 	var heatmap;
// 	heatmap = new google.maps.visualization.HeatmapLayer({
// 			data: marker,
// 			radius: radius,
// 			map: map
// 	});
// 	return heatmap;
// }

function initMap(x, y, map){
	map = new google.maps.Map(document.getElementById('map'),{
		center: {lat: x, lng: y},
		zoom: 13
	});
	return map;
}

