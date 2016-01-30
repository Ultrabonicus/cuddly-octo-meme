const quizApp = require('../../../main/assets/js/quizAppMaster.js')

const mocks = require('angular-mocks')

const _ = require('lodash')

describe("quizAppMaster", function(){
		
	let downloadResults, downloadResultsUtils
	
	beforeEach(function () {
			
		angular.mock.module('quizAppMaster')
		
		inject(function ($injector) {
			
			downloadResults = $injector.get('downloadResults')
			
			downloadResultsUtils = $injector.get('downloadResultsUtils')
			
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
				
				console.log(
					_.reduce(expectedObj.worksheet, function(result, value, key) {
						return _.isEqual(value, resul.worksheet[key]) ? result : result.concat(key);
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
	
})
