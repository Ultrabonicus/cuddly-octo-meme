var quizApp = require('../../../main/assets/js/quizAppUser.js')

describe("do the stuff", function(){
	it("app should be defined", function(){
		console.log(quizApp)
		expect(quizApp).toEqual(true)
	})
	it("shult be true", function(){
		var bool1 = true
		var bool2 = true
		expect(bool1).toEqual(bool2)
	})
	it("suult", function(){
		expect(true).toEqual(false)
	})
})
