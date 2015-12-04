var app = angular.module("quizAppUser", [
	'angular-websocket', 'rx'                                        
])
.factory('data', ['$websocket', '$window', 'rx', function($websocket, $window,rx) {
	/*
	var dataStream = $websocket('ws://localhost:8080/user/1/1');
	
	var observable = rx.Observable.create (function (obs) {
		console.log('creating obs')
		dataStream.onMessage = function(x){ obs.onNext(x)}
		dataStream.onError = function(x){ obs.onError(x)}
		dataStream.onClose = function(x) { obs.onCompleted(x)}
		
	});
	

	
	var observer = rx.Observer.create(function (data) {
		console.log('creating observer')
		console.log(dataStream.readyState)
		if(dataStream.readyState === WebSocket.OPEN) {dataStream.send(data); }
	});
	
	var subject = rx.Subject.create(observer, observable)
	
	subject.subscribe(
			function (x) { console.log('msg: ', x); },
			function (e) { console.log('onerror ', e)},
			function () {console.log('completed')}
		);
	
	subject.subscribe(
			function (x) { console.log('msg: ', x); },
			function (e) { console.log('onerror ', e)},
			function () {console.log('completed')}
		);
	
	var methods = {
		subject: subject,
		get: function() {
			console.log(typeof $websocket)
			dataStream.send(JSON.stringify({ action: 'get' }));
		}
	};
	*/
	
	var openObserver = rx.Observer.create(function(e) {
		console.info('socket open')
		
	});
	
	var closingObserver = rx.Observer.create(function(e) {
		console.log('socket is about to close');
	});
	
	var host = $window.location.host
	
	console.log(host)
	
	var socket = rx.DOM.fromWebSocket(
			'ws://' + host + '/user/1/1',
			null,
			openObserver,
			closingObserver
	)
	
	return socket;
}]);

app.controller('ButtonController', ['$window', '$scope', function ($window, $scope) {
	$scope.id = "0";
	$scope.clickMe = function() {
		$window.alert('Pff ' + $scope.id)
	};
}]);

app.controller('Ctrl', ['$window', '$scope', 'data', function ($window, $scope, data) {
	
	$scope.quiz = {}
	
	$scope.answers = {}
	
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
		
//		userQuiz.assigments.map(as=>as.answers.map(a=>a.map(z=>(z.isChecked=false; z))))
		console.log(newUserQuiz)
		$scope.quiz = newUserQuiz
		$scope.$apply()
	}
	
	$scope.sendSingleAnswer = function (qid, aid) {
	//	var newValue = $scope.quiz.assigments.map(x => x.map(z=>z.answers.map(y=>y.id)))
		var nv1 = $scope.quiz.assigments
		var nv2 = nv1.map(x=>x.answers)
		var nv3 = nv2.map(a=>a.map(z=>({"id":z.id, "isChecked":z.isChecked})))
		console.log(qid,aid)
		console.log(nv1,nv2,nv3)
		var answers = nv1.find(function(x){return x.queston.id === qid}).answers.filter(function(x){return x.isChecked}).map(function(z){return z.id})
		console.log({"queston":qid,"answer":answers})
		data.onNext(JSON.stringify([{"queston":qid,"answer":answers}]))
		
	}
	
	data
	.subscribe(
			function (x) { 
				console.log("received x", x.data);
				var json = JSON.parse(x.data)
				switch (json.code) {
				case 101:
					console.log("recived 101", json.load);
					$scope.updateQuiz(json.load);
					break;
				case 102:
					console.log("recived 102", json.load);
					break;
				case 202:
					console.log("recived 202", json.load);
					break;
				}
				
			},
			function (e) { console.log('onerror ', e);},
			function () {console.log('completed');}
		);
	
	console.log(data);
}]);
