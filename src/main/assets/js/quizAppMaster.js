import angular from 'angular';
import XLS from 'xlsx';
import Assigment from './classes/Assigment';
import Answer from './classes/Answer';
import Queston from './classes/Queston'; 
import Quiz from './classes/Quiz'; 
import AnswerStatusWithUserAnswer from './classes/AnswerStatusWithUserAnswer'; 
import AnswerStatus from './classes/AnswerStatus'; 
import FilledUserAnswer from './classes/FilledUserAnswer';
require('angular-file-saver');
require('rx');
require('rx-angular');
require('rx-dom');
require('angular-translate');

var app = angular.module("quizAppMaster", [
	'rx', 'ngFileSaver', 'pascalprecht.translate'
])

require('./quizAppMasterInt.js');

app.factory('createMasterConnection', ['$window', 'rx', function($window, rx) {
	
	
	function connect(quizId, onOpen, onClose) {
	
	var openObserver = rx.Observer.create(function(e) {
		console.info('socket open')
		onOpen()
	});
	
	var closingObserver = rx.Observer.create(function(e) {
		console.log('socket is about to close');
		onClose()
	});
	
	var host = $window.location.host
	
	var socket = rx.DOM.fromWebSocket(
			'ws://' + host + '/master/' + quizId,
			null,
			openObserver,
			closingObserver
	)
	
	console.log("WS connected")
	
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
		
		for (let i = 0; i < sheet.length; i++){
			let row = sheet[i]
			let queston = new Queston(i,row.que)
			let solution = row.answ.split(" ").map(function(x){return parseInt(x)})
			function parseAnswers(obje) {
				let answersArray = []
				for(let i = 1 ; !(obje[i] === undefined); i++){
					let answer = new Answer(i,obje[i])
					answersArray[i-1] = answer
				}
				return answersArray
			}
			let answers = parseAnswers(row)
			newObject.assigments[i] = new Assigment(queston, answers, solution)
		}
		
		return newObject
		
	}
		
	})
	
	return source
	
}])
.factory('downloadResults', ['$window', 'FileSaver', 'Blob', function($window, FileSaver, Blob){
	/*
	 * 
	 * example object
	{
		quizId: 1,
		answers: [{
			user: id,
			totalAnswered: 15,
			totalQuestons: 20,
			overall: 60,
			assigments: [
				qId: 1
				queston: "some queston", 
				answers: [
					{content: "some answer", id}
				],
				answered: [1,2]
				rightAnswers: [1]
			]
		}]
	}
	*/
	
	function cellify(value) {
/*
	function datenum(v,date1904) {
		if(date1904) v+=1462
		var epoch = Date.parse(v)
		return (epoch - newDate(Date.UTC(1899, 11, 300))) / (24 * 60 * 60 * 1000)
	}
*/
	const cell = {v: value}
	if(typeof cell.v === 'number') cell.t = 'n'
	else if(typeof cell.v === 'boolean') cell.t = 'b'
/*	else if(cell.v instanceof Date) {
		cell.t = 'n'
		cell.z = XLS.SSF._table[14]
		cell.v = datenum(cell.v)
	}
*/	else cell.t = 's'
	return cell
	}

	function nQuizToWorkbook(parsedNewQuiz, isMinimal){
		const firstSheetName = "firstSheet"
		const firstSheet = {};
		firstSheet[XLS.utils.encode_cell({c:0,r:0})] = cellify(123)
		firstSheet['!ref'] = XLS.utils.encode_range({s: {c:0, r:0}, e: {c: 0, r: 0}})
		
		const sheets = parsedNewQuiz.map(x => singleQuizToSheet(x, isMinimal))
		
		sheets
		
		const workbook = {}
		
		workbook.SheetNames = [firstSheetName].concat(sheets.map(x => x.sheetName.toString()))
		
		workbook.Sheets = {}
		
		sheets.forEach(x => workbook.Sheets[x.sheetName] = x.worksheet)
		
		workbook.Sheets[firstSheetName] = firstSheet
		
		console.log("SheetNames: ", workbook.SheetNames)
		console.log("Sheets: ", workbook.Sheets)
		
		const wbook = XLS.write(workbook, {bookType: 'xlsx', bookSST: true, type: 'binary'})
		
		return wbook
	}
	
	function percentToRGB(red, green, blue){
		function percentToHex(percent){
			const hexValue = Math.round(percent * 2.55).toString(16).toUpperCase()
			return hexValue.length === 1 ? "0" + hexValue : hexValue
		}
		const str = "00" + percentToHex(red) + percentToHex(green) + percentToHex(blue)
		return str
	}
	
	function singleQuizToSheet(parsedQuiz, isMinimal){
		const worksheet = parsedQuiz.assigments.reduce(function(acc, x, index){
			
			let idCell = cellify(x.qId)
			idCell['s'] = {
				fill: {
					fgColor: {rgb: percentToRGB(100,0,100)}
				}
				
			}
			acc[XLS.utils.encode_cell({c:0,r:index * 2 + 2})] = idCell
			acc[XLS.utils.encode_cell({c:0,r:index * 2 + 3})] = cellify(x.queston)
			x.answers.forEach(function(z, innerIndex){
				acc[XLS.utils.encode_cell({c:innerIndex + 1,r:index * 2 + 2})] = cellify(z.id)
				acc[XLS.utils.encode_cell({c:innerIndex + 1,r:index * 2 + 3})] = cellify(z.content)
			})
			acc[XLS.utils.encode_cell({c:1 + parsedQuiz.maxQuestonsLength, r:index * 2 + 2})] = cellify(x.rightAnswers.join(' '))
			acc[XLS.utils.encode_cell({c:1 + parsedQuiz.maxQuestonsLength, r:index * 2 + 3})] = cellify(x.answered.join(' '))
			
			return acc
		}, {})
		
		worksheet[XLS.utils.encode_cell({c:0,r:0})] = cellify("quiz id:")
		worksheet[XLS.utils.encode_cell({c:0,r:1})] = cellify(parsedQuiz.quizId)
		worksheet[XLS.utils.encode_cell({c:2,r:0})] = cellify("queston ID/queston")
		worksheet[XLS.utils.encode_cell({c:1 + parsedQuiz.maxQuestonsLength,r:0})] = cellify("right answers/user answers")
		
		worksheet['!ref'] = XLS.utils.encode_range({s: {c:0, r:0}, e: {c:1 + parsedQuiz.maxQuestonsLength, r: parsedQuiz.assigments.length * 2 + 3}})
			
		const sheetName = parsedQuiz.quizId
		
		return {worksheet: worksheet, sheetName: sheetName}
	}

	function parseAllQuizes(newQuiz, isMinimal){
		const parsedQuiz = newQuiz.quizes.map(x => parseSingleQuiz(x, isMinimal))
		console.log("Parsed quiz: ", parsedQuiz)
		
		const wbook = nQuizToWorkbook(parsedQuiz,isMinimal)
		console.log("Workbook: ", wbook)
		
		FileSaver.saveAs(new Blob([s2ab(wbook)], {type:"application/octet-stream"}), newQuiz.quizId + ".xlsx")
		
	}
	

	
	function parseSingleQuiz(quiz, isMinimal){
		console.log('given quiz is: ', quiz)
		const quizId = quiz.id
		let maxQuestonsLength = 0
		const assigments = quiz.assigments.map(function(x){
			const answers = x.answers.map(function(z){ return {'content': z.content, 'id': z.id } })
			if (answers.length > maxQuestonsLength) {
				maxQuestonsLength = answers.length
			}
			const answered = x.answers.reduce((acc, z) => z.isChecked ? acc.concat(z.id) : acc , [])
			const answer = {
				qId: x.queston.id,
				queston: x.queston.content,
				rightAnswers: x.solution,
				answers: answers,
				answered: answered
			}
			return answer
		})
		return {
			quizId: quizId,
			assigments: assigments,
			maxQuestonsLength: maxQuestonsLength
		}
	}
	
	function s2ab(s) {
		var buf = new ArrayBuffer(s.length)
		var view = new Uint8Array(buf)
		for(var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
		return buf
	}
	
	return parseAllQuizes
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


app.controller('Ctrl', ['rx', '$window', '$scope', 'createMasterConnection', 'dragndrop', 'sendNewQuiz', 'downloadResults', '$translate', function(rx, $window, $scope, createMasterConnection, dragndrop, sendNewQuiz, downloadResults, $translate) {
	
	$scope.changeLanguage = function(langKey) {
		console.log("changing language");
		$translate.use(langKey);
	}
	
	$scope.download = function() {console.log("dling"); downloadResults($scope.newQuiz, false)}
	
	$scope.connectionInfo = {
			"hide": false,
			"quizId": 0,
			"isConnected" : false,
			"connect": function(isNewQuizPresent){
				console.log("connecting to WS")
				if(this.quizId === 0) {
					alert("Wrong Id")
				} else {
					startWSconnection(this.quizId, !isNewQuizPresent)
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
	
	function addQuestonLengthField(quizes){
		
		const updatedQuizes = quizes.map(function(quiz){
			const maxAnswersLength = quiz.assigments.reduce(function(biggest, assigment){
				return biggest < assigment.answers.length ? assigment.answers.length : biggest
			},0)
			console.log('maxQuestonsLength: ', maxAnswersLength)
			quiz.maxAnswersLength = maxAnswersLength
			return quiz
		})
		
		return updatedQuizes
	}
	
	function parseNewQuizFromJson(json){
		
		const parsed = Array.prototype.map.call(json.quizes, function(quiz){
			
			const assigments = Array.prototype.map.call(quiz.assigments, function(assigment){
				
				const queston = new Queston(assigment.queston.id, assigment.queston.content)
				
				const answers = Array.prototype.map.call(assigment.answers, function(answer) {
					return new Answer(answer.id, answer.content)
				})
				
				const solution = assigment.solution
				
				return new Assigment(queston, answers, solution)
			})
			
			return new Quiz(quiz.id, assigments)
		})
		
		console.log("Parsed newQuiz from json: ", parsed)
		
		return parsed
	}
	
	$scope.toWorkingQuiz = function (){
			if($scope.newQuiz.quizes !== undefined){
				console.log("quizes defined, newQuiz object: ", $scope.newQuiz)
				var quizes = $scope.newQuiz.quizes
				quizes.forEach(function(quiz){
					quiz.assigments.forEach(function(assigment){
						assigment.answers.forEach(function(answer){
							answer.addChecked()
							console.log("transforming")
						})
					})
				})
			} else {
				console.warn("quizes is undefined! newQuiz object: ", $scope.newQuiz)
			}
	}
	
	$scope.sendNewQuiz = {
			hide: true,
			sendNewQuizToServer: function(){
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
				return quiz.id === userStatus.userId
			})
			console.log(quizz)
			quizz.assigments.forEach(function(assigment){
				var questi = assigment.queston
				var status = userStatus.status.find(function(x){
					return x.id === assigment.queston.id
				})
				if(status.filledUserAnswer !== undefined){
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
	
	let newQuizHelper = []
	
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
			console.log("complete", {quizes: newQuizHelper})
			$scope.newQuiz = {quizes: addQuestonLengthField(newQuizHelper), quizId: $scope.connectionInfo.quizId}
			$scope.hideDrop = true
			$scope.sendNewQuiz.hide = false
			$scope.$apply()
			newQuizHelper = []
		}
	)
	
	const autoupdate = {
		
		handle: null,
		
		start(){
			this.handle = setInterval(function () {
			send({"code":1})
			}, 3000)
		},
		
		stop(){
			clearInterval(this.handle)
		}
		
	}
	
	function startWSconnection(id, isWithoutNewQuiz){
		const rxSubject = createMasterConnection(id, isWithoutNewQuiz ? () => {send({"code":3}); autoupdate.start()} : () => autoupdate.start(), () => autoupdate.stop())
		$scope.connection = rxSubject
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
						$scope.newQuiz = { quizes: addQuestonLengthField(parseNewQuizFromJson(json.load)), quizId: $scope.connectionInfo.quizId }
						$scope.toWorkingQuiz()
						$scope.$apply()
						break;
					case 1103:
						console.log("recived 1103", json.load);
						$scope.fillAnswers(json.load.statusSeq)
						break;
					}
					
				},
				function (e) {
					console.log('onerror ', e);
					autoupdate.stop()
				},
				function () {
					console.log('completed');
					autoupdate.stop()
				}
		);
	}
	
	function send(value){
		var parsedValue = angular.toJson(value)
		if ($scope.connection === undefined){
			throw new {
				"name": 'NotConnectedException', 
				"message": "trying to send WS message while not connected"
			}
		} else {
			console.log("sending to server code: ", parsedValue)
			$scope.connection.onNext(parsedValue)
		}
	}

}]);

window.onbeforeunload = function(){
    socket.close();
};