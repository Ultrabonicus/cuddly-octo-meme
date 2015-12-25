'use strict';

export default class AnswerStatus {
	

	constructor(id, right, outOf) {
		if(!(typeof id === "number")){
			throw new TypeError("While creating AnswerStatus: type of id expected to be: number, instead got: " + id.constructor.name)
		}
		if(!(typeof right === "number")){
			throw new TypeError("While creating AnswerStatus: type of right expected to be: number, instead got: " + right.constructor.name)
		}
		if(!(typeof outOf === "number")){
			throw new TypeError("While creating AnswerStatus: type of outOf expected to be: number, instead got: " + outOf.constructor.name)
		}
		
		this.id = id
		
		this.right = right
		
		this.outOf = outOf
	}
}