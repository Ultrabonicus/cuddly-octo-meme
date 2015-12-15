var app = angular.module("quizAppMaster", [
	'ngWebSocket', 'rx'
])
.factory('createMasterConnection', ['$websocket', '$window', 'rx', function($websocket, $window, rx) {
	
	function connect(quizId) {
	
	var openObserver = rx.Observer.create(function(e) {
		console.info('socket open')
		
	});
	
	var closingObserver = rx.Observer.create(function(e) {
		console.log('socket is about to close');
	});
	
	var host = $window.location.host
	
	var socket = rx.DOM.fromWebSocket(
			'ws://' + host + '/master/' + quizId,
			null,
			openObserver,
			closingObserver
	)
	
	return socket
	}
	
	return connect
}])
.factory('dragndrop', ['$window', 'rx', function($window, rx){
	var source = rx.Observable.create(function(observable){
		
	var dropTarget = document.getElementById('dragTarget')
	
	var drop = rx.Observable.fromEvent(dropTarget, 'drop')
	var dragover = rx.Observable.fromEvent(dropTarget, 'dragover')
	
	dragover.subscribeOnNext(function(elem){
		elem.preventDefault();
	})
	
	drop.subscribeOnNext(handleDrop)
	
	function handleDrop(e) {
		console.log("started handling drop")
		e.stopPropagation();
		e.preventDefault();
		var files = e.dataTransfer.files;
		var i,f;
		for (i = 0, f = files[i]; i != files.length; ++i) {
			var reader = new FileReader();
			var name = f.name;
			reader.onload = function(e) {
				var data = e.target.result;
				/* if binary string, read with type 'binary' */
				var workbook = XLS.read(data, {type: 'binary'});
				
				console.log(workbook)
				
				var sheet_name_list = workbook.SheetNames;
				
				console.log(sheet_name_list[0])
				
				for(var i = 0; sheet_name_list.length > i; i++){
				
					var sheet = XLS.utils.sheet_to_json(workbook.Sheets[sheet_name_list[i]])
				
					observable.onNext(parseJsonToAssigment(sheet, i+1))
				}
				
				observable.onCompleted()

				
			};
			reader.readAsBinaryString(f);
			}
		}
	
	function parseJsonToAssigment(sheet, id) {
		var newObject = {}
		
		newObject.id = id
		newObject.assigments = []
		
		for (var i = 0; i < sheet.length; i++){
			var row = sheet[i]
			var assigment = {}
			assigment.queston = {}
			assigment.queston.id = i
			assigment.queston.content = row.que
			var answer = row.answ.split(" ").map(function(x){return parseInt(x)})
			assigment.solution = answer
			function parseAnswers(obje) {
				var answers = []
				for(var i = 1 ; !(obje[i] === undefined); i++){
					var answerObj = {}
					answerObj.id = i
					answerObj.content = obje[i]
					answers[i-1] = answerObj
				}
				return answers
			}
			assigment.answers = parseAnswers(row)
			newObject.assigments[i] = assigment
		}
		
		return newObject
		
	}
		
	})
	
	return source
	
}])
.factory('sendNewQuiz', ['$http', '$window', 'rx', function($http, $window, rx){
	
	function postNewQuiz(quiz){
		
		var promise = 
			$http.post(
				$window.location.href,
				angular.toJson(quiz)
			)
		
		return promise
	}
	
	return postNewQuiz
}])


app.controller('Ctrl', ['rx', '$window', '$scope', 'createMasterConnection', 'dragndrop', 'sendNewQuiz', function(rx, $window, $scope, createMasterConnection, dragndrop, sendNewQuiz) {
	
	$scope.connectionInfo = {
			"hide": false,
			"quizId": 0,
			"isConnected" : false,
			"connect": function(isNewQuizPresent){
				console.log("connecting to WS")
				if(this.quizId === 0) {
					alert("Wrong Id")
				} else {
					startWSconnection(createMasterConnection(this.quizId), !isNewQuizPresent)
					this.hide = true
					this.isConnected = true
					$scope.hideDrop = true
					if(isNewQuizPresent === true){
						$scope.toWorkingQuiz()
					}
					
				}
			}
	}
	

	
	$scope.changeChecked = function(userId, questonId, answerIdArray){
		var quiz = $scope.newQuiz.quizes.find(function(x){
			return x.id === userId
		})
		var assigment = quiz.assigments.find(function(assigment){
			console.log(assigment.queston.id, questonId)
			return assigment.queston.id === questonId
		})
		assigment.answers.forEach(function(answer){
			if (answerIdArray.some(function(x){
				return answer.id === x
			})){
				answer.isChecked = true
				console.log("changing to true")
			} else {
				answer.isChecked = false
			}
		})
	}
	
	$scope.toWorkingQuiz = function (){ 
			if($scope.newQuiz.quizes !== "undefined"){
				console.log("quizes defined")
				var quizes = $scope.newQuiz.quizes
				quizes.forEach(function(quiz){
					quiz.assigments.forEach(function(assigment){
						assigment.answers.forEach(function(answer){
							answer.isChecked = false
							console.log("transforming")
						})
					})
				})
			}
	}
	
	$scope.sendNewQuiz = {
			"hide": true,
			"sendNewQuizToServer": function(){
				sendNewQuiz($scope.newQuiz).then( function(response){
					console.log(response.data.quizId)
					$scope.connectionInfo.quizId = response.data.quizId
					$scope.connectionInfo.connect(true)
					$scope.sendNewQuiz.hide = true
				}, function(response){
					console.log("problem sending quiz to server", response)
				})
				}
	}
	
	$scope.fillAnswers = function(statusSeq){
		if(statusSeq.length === 0){
			console.log("can't fill with empty status seq")
		} else {
		statusSeq.forEach(function(userStatus){
			var quizz = $scope.newQuiz.quizes.find(function(quiz){
				console.log("trtrtrtrtr",quiz, userStatus)
				return quiz.id === userStatus.userId
			})
			console.log(quizz)
			quizz.assigments.forEach(function(assigment){
				var questi = assigment.queston
				console.log("questi", questi)
				var status = userStatus.status.find(function(x){
					console.log("gzgzgzgzgzgzgzgzgzgz",x, assigment)
					return x.id === assigment.queston.id
				})
				if((typeof status.filledUserAnswer) !== "undefined"){
				var answersArray = status.filledUserAnswer.answer
					console.log("nrs",userStatus.userId,status.id,answersArray)
					$scope.changeChecked(userStatus.userId,status.id,answersArray)
					console.log("mutating")
					$scope.$apply()
				}
			})
		})
		}
	}
	
	$scope.newQuiz = {}
	
	var newQuizHelper = []
	
	$scope.hideDrop = false
	
	dragndrop.subscribe(
		function(x){
			console.log(x);
			newQuizHelper.push(x)
		},
		function(e){
			console.log(e)
		},
		function(){
			console.log("complete", {"quizes": newQuizHelper})
			$scope.newQuiz = {"quizes": newQuizHelper}
			$scope.hideDrop = true
			$scope.sendNewQuiz.hide = false
			$scope.$apply()
			newQuizHelper = []
		}
	)
	
	function startWSconnection(rxSubject, isWithoutNewQuiz){
		$scope.connection = rxSubject
		if(isWithoutNewQuiz){
			setTimeout(function(){
				send({"code":3})
				console.log("withoutNewQuiz")	
			}, 1000)
		}
		var handle = setInterval(function () {
			send({"code":1})
		}, 3000)
		$scope.connection
		.subscribe(
				function (x) { 
					console.log("received x", x.data);
					var json = JSON.parse(x.data)
					switch (json.code) {
					case 1101:
						console.log("recived 1101", json.load);
						break;
					case 1102:
						console.log("recived 1102", json.load);
						$scope.newQuiz = json.load
						$scope.toWorkingQuiz()
						break;
					case 1103:
						console.log("recived 1103", json.load);
						$scope.fillAnswers(json.load.statusSeq)
						break;
					}
					
				},
				function (e) {
					console.log('onerror ', e);
				},
				function () {
					console.log('completed');
					clearInterval(handle)
					subj.onCompleted()
				}
		);
	}
	
	function send(value){
		parsedValue = angular.toJson(value)
		if ($scope.connection === "undefined"){
			throw new {
				"name": 'NotConnectedException', 
				"message": "trying to send WS message while not connected"
			}
		} else {
			$scope.connection.onNext(parsedValue)
		}
	}

}]);

window.onbeforeunload = function(){
    socket.close();
};