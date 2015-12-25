'use strict';

import AnswerStatus from './AnswerStatus';
import FilledUserAnswer from './FilledUserAnswer';

export default class AnswerStatusWithUserAnswer extends AnswerStatus {
	constructor(id, right, outOf, filledUserAnswer) {
		if(!(filledUserAnswer instanceof FilledUserAnswer)){
			throw new TypeError("While creating AnswerStatusWithUserAnswer: type of filledUserAnswer expected to be: FilledUserAnswer, instead got: " + 	filledUserAnswer.constructor.name)
		}
		
		super(id, right, outOf)
		
		this.filledUserAnswer = filledUserAnswer
	}
}