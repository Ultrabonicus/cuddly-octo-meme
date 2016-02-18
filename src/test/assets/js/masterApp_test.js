const quizApp = require('../../../main/assets/js/quizAppMaster.js')

const mocks = require('angular-mocks')

import Assigment from '../../../main/assets/js/classes/Assigment';
import Answer from '../../../main/assets/js/classes/Answer';
import Queston from '../../../main/assets/js/classes/Queston'; 
import Quiz from '../../../main/assets/js/classes/Quiz'; 

const _ = require('lodash')



describe("quizAppMaster", function(){
		
	let $httpBackend, $window, $controller, sendNewQuiz, downloadResults, downloadResultsUtils, randomizeQuiz
	
	beforeEach(function () {
			
		angular.mock.module('quizAppMaster')
		
		inject(function ($injector) {
			
			$httpBackend = $injector.get('$httpBackend')
			
			$window = $injector.get('$window')
			
			sendNewQuiz = $injector.get('sendNewQuiz')
			
			downloadResults = $injector.get('downloadResults')
			
			downloadResultsUtils = $injector.get('downloadResultsUtils')
			
			randomizeQuiz = $injector.get('randomizeQuiz')
		})
		
	})
	
	describe("downloadResultsUtils", function() {
		
		describe("cellify", function() {
			
			it("should return type s for string", function() {
				expect(downloadResultsUtils.cellify("string").t).toEqual("s")
			})
			
			it("should return type n for number", function() {
				expect(downloadResultsUtils.cellify(123).t).toEqual("n")
			})
			
			it("should return type b for boolean", function() {
				expect(downloadResultsUtils.cellify(true).t).toEqual("b")
			})
			
			it("should store value in .v", function() {
				expect(downloadResultsUtils.cellify("some").v).toEqual("some")
			})
			
			it("should store value in .v 2", function() {
				expect(downloadResultsUtils.cellify(false).v).toEqual(false)
			})
			
		})
		
		describe("parseSingleQuiz", function(){
			
			const quizToParse = {"id":1,"assigments":[{"queston":{"id":0,"content":"queston1123"},"answers":[{"id":1,"content":"fghfghf","isChecked":true},{"id":2,"content":"fgnbvn","isChecked":true},{"id":3,"content":"rty","isChecked":true},{"id":4,"content":"rty","isChecked":false},{"id":5,"content":"rtyrt","isChecked":false},{"id":6,"content":"rtyfgh","isChecked":false}],"solution":[2,3]},{"queston":{"id":1,"content":"queston11534"},"answers":[{"id":1,"content":"fgfh","isChecked":true},{"id":2,"content":"fghfg","isChecked":true},{"id":3,"content":"fgh","isChecked":false},{"id":4,"content":"fghgf","isChecked":false},{"id":5,"content":"fghfgh","isChecked":false},{"id":6,"content":"fghfgrt","isChecked":false}],"solution":[4,5,6]}],"maxAnswersLength":6}
			
			const expectedParsed = {"quizId":1,"assigments":[{"qId":0,"queston":"queston1123","rightAnswers":[2,3],"answers":[{"content":"fghfghf","id":1},{"content":"fgnbvn","id":2},{"content":"rty","id":3},{"content":"rty","id":4},{"content":"rtyrt","id":5},{"content":"rtyfgh","id":6}],"answered":[1,2,3]},{"qId":1,"queston":"queston11534","rightAnswers":[4,5,6],"answers":[{"content":"fgfh","id":1},{"content":"fghfg","id":2},{"content":"fgh","id":3},{"content":"fghgf","id":4},{"content":"fghfgh","id":5},{"content":"fghfgrt","id":6}],"answered":[1,2]}],"maxQuestonsLength":6}
			
			it('should return in expected format', function(){
				
				const parsed = downloadResultsUtils.parseSingleQuiz(quizToParse)
				
				console.log("missing fields: " ,
					_.reduce(expectedParsed, function(result, value, key) {
						return _.isEqual(value, parsed[key]) ? result : result.concat(key);
					}, [])
				)
				
				console.log("unnecessary fields: " ,
					_.reduce(parsed, function(result, value, key) {
						return _.isEqual(value, expectedParsed[key]) ? result : result.concat(key);
					}, [])
				)				

				expect(parsed).toEqual(expectedParsed)
			})
			
		})
		
		
		describe("singleQuizToSheet", function() {
			/*		
			angular.mock.module(function($provide) {
				$provide.factory('$translate', function(){
					function instant(){
						return {
							SPREADSHEET_QUIZ_ID: "ИД опроса",
							SPREADSHEET_QUESTON_ID: "ИД вопроса/вопрос",
							SPREADSHEET_ANSWERS: "Правильные ответы/Пользовательские ответы"
						}
					}
					
					return {
						instant: instant
					}
				})
			})
			*/
			const expectedObj = {"worksheet": {"A3":{"v":0,"t":"n","s":{"fill":{"fgColor":{"rgb":"00FF00FF"}}}},"A4":{"v":"queston1123","t":"s"},"B3":{"v":1,"t":"n"},"B4":{"v":"fghfghf","t":"s"},"C3":{"v":2,"t":"n"},"C4":{"v":"fgnbvn","t":"s"},"D3":{"v":3,"t":"n"},"D4":{"v":"rty","t":"s"},"E3":{"v":4,"t":"n"},"E4":{"v":"rty","t":"s"},"F3":{"v":5,"t":"n"},"F4":{"v":"rtyrt","t":"s"},"G3":{"v":6,"t":"n"},"G4":{"v":"rtyfgh","t":"s"},"H3":{"v":"2 3","t":"s"},"H4":{"v":"1 2","t":"s"},"A5":{"v":1,"t":"n","s":{"fill":{"fgColor":{"rgb":"00FF00FF"}}}},"A6":{"v":"queston11534","t":"s"},"B5":{"v":1,"t":"n"},"B6":{"v":"fgfh","t":"s"},"C5":{"v":2,"t":"n"},"C6":{"v":"fghfg","t":"s"},"D5":{"v":3,"t":"n"},"D6":{"v":"fgh","t":"s"},"E5":{"v":4,"t":"n"},"E6":{"v":"fghgf","t":"s"},"F5":{"v":5,"t":"n"},"F6":{"v":"fghfgh","t":"s"},"G5":{"v":6,"t":"n"},"G6":{"v":"fghfgrt","t":"s"},"H5":{"v":"4 5 6","t":"s"},"H6":{"v":"1 2","t":"s"},"A1":{"v":"ИД опроса:","t":"s"},"A2":{"v":1,"t":"n"},"C1":{"v":"ИД вопроса/вопрос","t":"s"},"H1":{"v":"Правильные ответы/Пользовательские ответы","t":"s"},"!ref":"A1:H8"}, "sheetName": 1}
			
			const givenQuizObj = {"quizId":1,"assigments":[{"qId":0,"queston":"queston1123","rightAnswers":[2,3],"answers":[{"content":"fghfghf","id":1},{"content":"fgnbvn","id":2},{"content":"rty","id":3},{"content":"rty","id":4},{"content":"rtyrt","id":5},{"content":"rtyfgh","id":6}],"answered":[1,2]},{"qId":1,"queston":"queston11534","rightAnswers":[4,5,6],"answers":[{"content":"fgfh","id":1},{"content":"fghfg","id":2},{"content":"fgh","id":3},{"content":"fghgf","id":4},{"content":"fghfgh","id":5},{"content":"fghfgrt","id":6}],"answered":[1,2]}],"maxQuestonsLength":6}

			//			{"id":1,"assigments":[{"queston":{"id":0,"content":"queston1123"},"answers":[{"id":1,"content":"fghfghf","isChecked":true},{"id":2,"content":"fgnbvn","isChecked":true},{"id":3,"content":"rty","isChecked":false},{"id":4,"content":"rty","isChecked":false},{"id":5,"content":"rtyrt","isChecked":false},{"id":6,"content":"rtyfgh","isChecked":false}],"solution":[2,3]},{"queston":{"id":1,"content":"queston11534"},"answers":[{"id":1,"content":"fgfh","isChecked":true},{"id":2,"content":"fghfg","isChecked":true},{"id":3,"content":"fgh","isChecked":false},{"id":4,"content":"fghgf","isChecked":false},{"id":5,"content":"fghfgh","isChecked":false},{"id":6,"content":"fghfgrt","isChecked":false}],"solution":[4,5,6]}],"maxAnswersLength":6}
			
			it("should return in expected format", function(){
			
				const resul = downloadResultsUtils.singleQuizToSheet(givenQuizObj)
				
				console.log("missing fields: " ,
					_.reduce(expectedObj.worksheet, function(result, value, key) {
						return _.isEqual(value, resul.worksheet[key]) ? result : result.concat(key);
					}, [])
				)
			
				console.log("unnecessary fields: " ,
					_.reduce(resul.worksheet, function(result, value, key) {
						return _.isEqual(value, expectedObj.worksheet[key]) ? result : result.concat(key);
					}, [])
				)				
				
				expect(resul).toEqual(expectedObj)
			})
			
			it("stub", function() {
				expect({"file": {"file2":"строка"}}).toEqual({file: {file2:"строка"}})
			})
		
		})
		
	})
	
	describe("downloadResults", function() {
	
		it("app should be defined", function(){
			expect(typeof downloadResults).toBe("function")
		})
		
	})
	
	describe('sendNewQuiz', function(){
		
		afterEach(function(){
			$httpBackend.verifyNoOutstandingExpectation()
			$httpBackend.verifyNoOutstandingRequest()
		})
		
		const expected = {"quizes":[{"id":1,"assigments":[{"queston":{"id":0,"content":"queston1123"},"answers":[{"id":1,"content":"fghfghf","isChecked":false},{"id":2,"content":"fgnbvn","isChecked":false},{"id":3,"content":"rty","isChecked":false},{"id":4,"content":"rty","isChecked":false},{"id":5,"content":"rtyrt","isChecked":false},{"id":6,"content":"rtyfgh","isChecked":false}],"solution":[2,3]},{"queston":{"id":1,"content":"queston11534"},"answers":[{"id":1,"content":"fgfh","isChecked":false},{"id":2,"content":"fghfg","isChecked":false},{"id":3,"content":"fgh","isChecked":false},{"id":4,"content":"fghgf","isChecked":false},{"id":5,"content":"fghfgh","isChecked":false},{"id":6,"content":"fghfgrt","isChecked":false}],"solution":[4,5,6]}],"maxAnswersLength":6},{"id":2,"assigments":[{"queston":{"id":0,"content":"que1"},"answers":[{"id":1,"content":"qwe","isChecked":false},{"id":2,"content":"qwe","isChecked":false},{"id":3,"content":"asd","isChecked":false},{"id":4,"content":"zxc","isChecked":false}],"solution":[2]},{"queston":{"id":1,"content":"que2"},"answers":[{"id":1,"content":"qweqwe","isChecked":false},{"id":2,"content":"sadasd","isChecked":false},{"id":3,"content":"qweqw","isChecked":false},{"id":4,"content":"asdasd","isChecked":false}],"solution":[3]},{"queston":{"id":2,"content":"que3"},"answers":[{"id":1,"content":"qweawd","isChecked":false},{"id":2,"content":"qweqw","isChecked":false},{"id":3,"content":"sdqwe","isChecked":false},{"id":4,"content":"sadqwe","isChecked":false}],"solution":[4]}],"maxAnswersLength":4},{"id":3,"assigments":[{"queston":{"id":0,"content":"Какое число нечётное"},"answers":[{"id":1,"content":"1","isChecked":false},{"id":2,"content":"2","isChecked":false},{"id":3,"content":"6","isChecked":false},{"id":4,"content":"77","isChecked":false}],"solution":[1,4]},{"queston":{"id":1,"content":"Сколько часов в сутках"},"answers":[{"id":1,"content":"23","isChecked":false},{"id":2,"content":"27","isChecked":false},{"id":3,"content":"24","isChecked":false}],"solution":[3]},{"queston":{"id":2,"content":"2 * 3"},"answers":[{"id":1,"content":"5","isChecked":false},{"id":2,"content":"6","isChecked":false},{"id":3,"content":"8","isChecked":false},{"id":4,"content":"4","isChecked":false}],"solution":[2]}],"maxAnswersLength":4}],"quizId":0}
		
		it('should send newQuiz', function(){
			$httpBackend.expectPOST($window.location.href, expected).respond(202, 1)
			sendNewQuiz(expected)
			$httpBackend.flush()
		})
		
	})
	
	describe('randomizeQuiz', function(){
		describe('should generate basic object with 2 quizes in expected format', function(){
			
			const given = [
				{
					assigment: new Assigment(
						new Queston(1, 'first queston'),
						[
							new Answer(1, 'answer1'),
							new Answer(2, 'answer2'),
							new Answer(3, 'answer3')
						],
						[1,2]
					),
					group: 1
				},{
					assigment: new Assigment(
						new Queston(2, 'second queston'),
						[
							new Answer(1, 'answerb1'),
							new Answer(2, 'answerb2')
						],
						[1]
					),
					group: 1
				},{
					assigment: new Assigment(
						new Queston(3, 'third queston'),
						[
							new Answer(1, 'answerc1'),
							new Answer(2, 'answerc2'),
							new Answer(3, 'answerc3')
						],
						[3]
					),
					group: 1
				},{
					assigment: new Assigment(
						new Queston(4, 'fourth queston'),
						[
							new Answer(1, 'answerx1'),
							new Answer(2, 'answerx2'),
							new Answer(3, 'answerx3'),
							new Answer(4, 'answerx4')
						],
						[3,4]
					),
					group: 2
				},{
					assigment: new Assigment(
						new Queston(5, 'fifth queston'),
						[
							new Answer(1, 'answerz1'),
							new Answer(2, 'answerz2'),
							new Answer(3, 'answerz3')
						],
						[3]
					),
					group: 2
				}
			]
			
			const expected = {
				asymmetricMatch: function(actual) {
					const fromFirstGroup = [1,2,3].some(x => x === actual[0].queston.id)
					const fromSecondGroup = [4,5].some(x => x === actual[1].queston.id)
					return fromFirstGroup && fromSecondGroup
				}
			}
			
			console.log('rquiz: ', randomizeQuiz)
			
//			console.log(randomizeQuiz(given, {1:1, 2:1}, 2, 'random'))
			
			it('length should be equal to sum of third argument', function() {
				expect(randomizeQuiz(given, {1:1, 2:1}, 2, 'random').quizes.length).toEqual(2)
			})
			
			it('length should be equal to sum of second argument', function() {
				expect(randomizeQuiz(given, {1:1, 2:1}, 2, 'random').quizes[0].assigments.length).toEqual(2)
			})
			
			it('length should be equal to sum of second argument [3]', function() {
				expect(randomizeQuiz(given, {1:1, 2:2}, 2, 'random').quizes[0].assigments.length).toEqual(3)
			})
			
			it("length shouldn't be larger than possible even if requested number is larger", function() {
				expect(randomizeQuiz(given, {1:1, 2:4}, 2, 'random').quizes[0].assigments.length).toEqual(3)
			})
			
			it('groups should match second argument and be in correct order', function(){
				expect(randomizeQuiz(given, {1:1, 2:1}, 2, 'random').quizes[0].assigments).toEqual(expected)
			})

			it('type of assigment field should be Quiz', function(){
				expect(randomizeQuiz(given, {1:1, 2:1}, 2, 'random').quizes[0]).toEqual(jasmine.any(Quiz))
			})
		})
})
})	
	describe('quizAppMaster controller', function() {
	beforeEach(function() {
		
		const createMasterConnection = function($window, rx, $timeout){
			
			const mockSocketObserver = rx.Observer.create(
				function(x) {
					console.log('received at WS mock: ', x)
				},
				function(err) {
					console.log('received error at WS mock: ', err)
				},
				function() {
					console.log('completed at WS mock')
				}
			)
			
			const firstResponse = {data: JSON.stringify({
				code: 1102,
				load: {
					"quizes":[{"id":1,"assigments":[{"queston":{"id":0,"content":"queston1123"},"answers":[{"id":1,"content":"fghfghf"},{"id":2,"content":"fgnbvn"},{"id":3,"content":"rty"},{"id":4,"content":"rty"},{"id":5,"content":"rtyrt"},{"id":6,"content":"rtyfgh"}],"solution":[2,3]},{"queston":{"id":1,"content":"queston11534"},"answers":[{"id":1,"content":"fgfh"},{"id":2,"content":"fghfg"},{"id":3,"content":"fgh"},{"id":4,"content":"fghgf"},{"id":5,"content":"fghfgh"},{"id":6,"content":"fghfgrt"}],"solution":[4,5,6]}]},{"id":2,"assigments":[{"queston":{"id":0,"content":"que1"},"answers":[{"id":1,"content":"qwe"},{"id":2,"content":"qwe"},{"id":3,"content":"asd"},{"id":4,"content":"zxc"}],"solution":[2]},{"queston":{"id":1,"content":"que2"},"answers":[{"id":1,"content":"qweqwe"},{"id":2,"content":"sadasd"},{"id":3,"content":"qweqw"},{"id":4,"content":"asdasd"}],"solution":[3]},{"queston":{"id":2,"content":"que3"},"answers":[{"id":1,"content":"qweawd"},{"id":2,"content":"qweqw"},{"id":3,"content":"sdqwe"},{"id":4,"content":"sadqwe"}],"solution":[4]}]},{"id":3,"assigments":[{"queston":{"id":0,"content":"Какое число нечётное"},"answers":[{"id":1,"content":"1"},{"id":2,"content":"2"},{"id":3,"content":"6"},{"id":4,"content":"77"}],"solution":[1,4]},{"queston":{"id":1,"content":"Сколько часов в сутках"},"answers":[{"id":1,"content":"23"},{"id":2,"content":"27"},{"id":3,"content":"24"}],"solution":[3]},{"queston":{"id":2,"content":"2 * 3"},"answers":[{"id":1,"content":"5"},{"id":2,"content":"6"},{"id":3,"content":"8"},{"id":4,"content":"4"}],"solution":[2]}]}]
				}
			})}
			
			const mockSocketObservable = rx.Observable.create(function (observer){
				console.log('created observable')
				$timeout(()=>{observer.onNext(firstResponse)},1000)
			})
			
			function mockWsSubject(quizId, onOpen, onClose){
				console.log('creating mocking connection with id: ', quizId)
				
				const subject = new rx.Subject.create(mockSocketObserver, mockSocketObservable)
				
				$timeout(() => {onOpen()}, 500)
				return subject
			}
			
			return mockWsSubject
		}
		
		
		angular.mock.module('quizAppMaster', function($provide) {
			$provide.factory('createMasterConnection', ['$window', 'rx', '$timeout' ,createMasterConnection])
		})
	})
	
	let $controller, $timeout, $interval
	
	beforeEach(inject(function(_$controller_, _$timeout_, _$interval_){
		$controller = _$controller_
		$timeout = _$timeout_
		$interval = _$interval_
	}))
	
	describe('controller', function() {
		
		
		
		it('get from server WS connection', function(){
			let $scope = {
				$apply: function(){},
				$watch: angular.identity
			}
			const controller = $controller('Ctrl', {$scope: $scope})
			$scope.connectionInfo.quizId = 1
			$scope.connectionInfo.connect(false)
			console.log('type of scopeapply: ', $scope.$apply)
			$scope.$apply()
			console.log('before flush')
			$timeout.flush(1500)
			console.log('after flush')
			$interval.flush(5000)
			console.log('after interval flush')
			$scope.newQuiz
			
			/*
				OLD
			let expected = {"quizes":[{"id":1,"assigments":[{"queston":{"id":0,"content":"queston1123"},"answers":[{"id":1,"content":"fghfghf","isChecked":false},{"id":2,"content":"fgnbvn","isChecked":false},{"id":3,"content":"rty","isChecked":false},{"id":4,"content":"rty","isChecked":false},{"id":5,"content":"rtyrt","isChecked":false},{"id":6,"content":"rtyfgh","isChecked":false}],"solution":[2,3]},{"queston":{"id":1,"content":"queston11534"},"answers":[{"id":1,"content":"fgfh","isChecked":false},{"id":2,"content":"fghfg","isChecked":false},{"id":3,"content":"fgh","isChecked":false},{"id":4,"content":"fghgf","isChecked":false},{"id":5,"content":"fghfgh","isChecked":false},{"id":6,"content":"fghfgrt","isChecked":false}],"solution":[4,5,6]}],"maxAnswersLength":6},{"id":2,"assigments":[{"queston":{"id":0,"content":"que1"},"answers":[{"id":1,"content":"qwe","isChecked":false},{"id":2,"content":"qwe","isChecked":false},{"id":3,"content":"asd","isChecked":false},{"id":4,"content":"zxc","isChecked":false}],"solution":[2]},{"queston":{"id":1,"content":"que2"},"answers":[{"id":1,"content":"qweqwe","isChecked":false},{"id":2,"content":"sadasd","isChecked":false},{"id":3,"content":"qweqw","isChecked":false},{"id":4,"content":"asdasd","isChecked":false}],"solution":[3]},{"queston":{"id":2,"content":"que3"},"answers":[{"id":1,"content":"qweawd","isChecked":false},{"id":2,"content":"qweqw","isChecked":false},{"id":3,"content":"sdqwe","isChecked":false},{"id":4,"content":"sadqwe","isChecked":false}],"solution":[4]}],"maxAnswersLength":4},{"id":3,"assigments":[{"queston":{"id":0,"content":"Какое число нечётное"},"answers":[{"id":1,"content":"1","isChecked":false},{"id":2,"content":"2","isChecked":false},{"id":3,"content":"6","isChecked":false},{"id":4,"content":"77","isChecked":false}],"solution":[1,4]},{"queston":{"id":1,"content":"Сколько часов в сутках"},"answers":[{"id":1,"content":"23","isChecked":false},{"id":2,"content":"27","isChecked":false},{"id":3,"content":"24","isChecked":false}],"solution":[3]},{"queston":{"id":2,"content":"2 * 3"},"answers":[{"id":1,"content":"5","isChecked":false},{"id":2,"content":"6","isChecked":false},{"id":3,"content":"8","isChecked":false},{"id":4,"content":"4","isChecked":false}],"solution":[2]}],"maxAnswersLength":4}],"quizId":1}
			*/
			
			// NEW
			let expected = {"quizes":[{"id":1,"assigments":[{"queston":{"id":0,"content":"queston1123"},"answers":[{"id":1,"content":"fghfghf"},{"id":2,"content":"fgnbvn"},{"id":3,"content":"rty"},{"id":4,"content":"rty"},{"id":5,"content":"rtyrt"},{"id":6,"content":"rtyfgh"}],"solution":[2,3]},{"queston":{"id":1,"content":"queston11534"},"answers":[{"id":1,"content":"fgfh"},{"id":2,"content":"fghfg"},{"id":3,"content":"fgh"},{"id":4,"content":"fghgf"},{"id":5,"content":"fghfgh"},{"id":6,"content":"fghfgrt"}],"solution":[4,5,6]}],"maxAnswersLength":6},{"id":2,"assigments":[{"queston":{"id":0,"content":"que1"},"answers":[{"id":1,"content":"qwe"},{"id":2,"content":"qwe"},{"id":3,"content":"asd"},{"id":4,"content":"zxc"}],"solution":[2]},{"queston":{"id":1,"content":"que2"},"answers":[{"id":1,"content":"qweqwe"},{"id":2,"content":"sadasd"},{"id":3,"content":"qweqw"},{"id":4,"content":"asdasd"}],"solution":[3]},{"queston":{"id":2,"content":"que3"},"answers":[{"id":1,"content":"qweawd"},{"id":2,"content":"qweqw"},{"id":3,"content":"sdqwe"},{"id":4,"content":"sadqwe"}],"solution":[4]}],"maxAnswersLength":4},{"id":3,"assigments":[{"queston":{"id":0,"content":"Какое число нечётное"},"answers":[{"id":1,"content":"1"},{"id":2,"content":"2"},{"id":3,"content":"6"},{"id":4,"content":"77"}],"solution":[1,4]},{"queston":{"id":1,"content":"Сколько часов в сутках"},"answers":[{"id":1,"content":"23"},{"id":2,"content":"27"},{"id":3,"content":"24"}],"solution":[3]},{"queston":{"id":2,"content":"2 * 3"},"answers":[{"id":1,"content":"5"},{"id":2,"content":"6"},{"id":3,"content":"8"},{"id":4,"content":"4"}],"solution":[2]}],"maxAnswersLength":4}],"quizId":1}			
			
			expect(JSON.parse(JSON.stringify($scope.newQuiz))).toEqual(expected)
		})
	})
})
	

