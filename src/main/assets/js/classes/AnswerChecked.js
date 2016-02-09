'use strict';

import Answer from './Answer';

export default class AnswerChecked extends Answer {
	constructor(id, content, isChecked) {
		
		super(id, content)
		
		this.isChecked = isChecked
		
		
	}
	/*
	addChecked(){
		return super.addChecked()
	}*/
	
	isRight(solutionArray){
		return super.isRight(solutionArray)
	}
	/*
	isRight(solutionArray){
		return solutionArray.some(x => x === this.id)
	}
	*/
}