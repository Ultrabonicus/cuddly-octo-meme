var app = angular.module("quizApp", [
	'ngWebSocket'
])
.factory('MyData', function($websocket){
	var dataStream = $websocket('wss://website.com/data');
	
	var collection = [];
})
