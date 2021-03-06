import angular from 'angular';
require('rx');
require('rx-angular');
require('rx-dom');
require('angular-translate');



var app = angular.module("quizAppUser", [
	'rx', 'pascalprecht.translate'
])

require('./quizAppUserInt.js');

app.factory('createConnection', ['$window', 'rx', function($window, rx) {
	
	function connect(quizId, userId, onOpen, onClose) {
	
	var openObserver = rx.Observer.create(function(e) {
		console.info('socket open');
		onOpen ? onOpen() : angular.noop
		
	});
	
	var closingObserver = rx.Observer.create(function(e) {
		console.log('socket is about to close');
		onClose ? onClose() : angular.noop
	});
	
	var host = $window.location.host
	
	console.log(host)
	
	var socket = rx.DOM.fromWebSocket(
			'ws://' + host + '/user/' + quizId + '/' + userId,
			null,
			openObserver,
			closingObserver
	)
	
	return socket
	}
	
	return connect
}]);

app.controller('Ctrl', ['$window', '$scope', 'createConnection', '$translate', function ($window, $scope, createConnection, $translate) {
	
	$scope.changeLanguage = function(langKey) {
		console.log("changing language");
		$translate.use(langKey);
	}	
	
	$scope.connectionInfo = {
			"hide": false,
			"userId": 0,
			"quizId": 0,
			"connect": function(){
				console.log("connecting to WS")
				if($scope.connectionInfo.quizId === 0 || $scope.connectionInfo.userId === 0) {
					alert("Wrong Id/s")
				} else {
					startWSconnection($scope.connectionInfo.quizId,$scope.connectionInfo.userId)
					this.hide = true
				}
			}
	}
	
	$scope.quiz = {}
	
	$scope.updateQuiz = function (userQuiz){
		var newUserQuiz = {"id":userQuiz.id}
		newUserQuiz.assigments = userQuiz
			.assigments
				.map(function(as){ 
					as.answers = Array.prototype.map.call(as.answers ,(
							function(a){
								a.isChecked = false
								return a
							})
						)
					return as
				})
		console.log(newUserQuiz)
		$scope.quiz = newUserQuiz
		$scope.$apply()
	}
	
	$scope.sendSingleAnswer = function (qid, aid) {
		var nv1 = $scope.quiz.assigments
		var answers = nv1.find(function(x){return x.queston.id === qid})
						.answers
						.filter(function(x){return x.isChecked})
						.map(function(z){return z.id})
		console.log({"queston":qid,"answer":answers})
		send([{"queston":qid,"answer":answers}])
		
	}
	
	$scope.fillAnswers = function (filledAnswers) {
		if(filledAnswers.length > 0){
		console.log(filledAnswers, typeof filledAnswers)
		filledAnswers.forEach(function (x) {
				console.log("inside")
				var assigment = $scope
					.quiz
					.assigments
					.find(function (z) {
						return z.queston.id === x.queston
					})
					
				console.log(assigment)
				if (assigment !== undefined){
					console.log("first: ", assigment)
					assigment.answers
					.forEach(function (z) {
						console.log("second: ", z)
						if (x.answer.some(function (y){
							return y === z.id
						})) {
							console.log(z)
							z.isChecked = true
						}
					})
				}	
			
			
			})
		}	
	} 
	
	$scope.connection = {}
	
	function send(value){
		var parsedValue = angular.toJson(value)
		if ($scope.connection === undefined){
			throw new {
				"name": 'NotConnectedException', 
				"message": "trying to send WS message while not connected"
			}
		} else {
			$scope.connection.onNext(parsedValue)
		}
	}
	
	function startWSconnection(qId, uId){
	const rxSubject = createConnection(qId, uId)
	$scope.connection = rxSubject
	$scope.connection
	.subscribe(
			function (x) { 
				console.log("received x", x.data);
				var json = JSON.parse(x.data)
				switch (json.code) {
				case 2101:
					console.log("recived 2101", json.load);
					$scope.updateQuiz(json.load);
					break;
				case 2102:
					console.log("recived 2102", json.load);
					$scope.fillAnswers(json.load)
					break;
				case 2202:
					console.log("recived 2202", json.load);
					break;
				}
				
			},
			function (e) { console.log('onerror ', e);},
			function () {console.log('completed');}
		);
	}
}]);

window.onbeforeunload = function(){
    socket.close();
};
