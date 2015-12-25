'use strict';

export default class FilledUserAnswer {
	constructor(queston, answer){
		if(!(typeof queston === "number")){
			throw new TypeError("While creating FilledUserAnswer: type of queston expected to be: number, instead got: " + queston.constructor.name)
		}
		if(!(answer instanceof Array)){
			throw new TypeError("While creating FilledUserAnswer: class of answer expected to be: Array, instead got: " + answer.constructor.name)
		}
		
		this.queston = queston
		
		this.answer = answer
	}
	
}