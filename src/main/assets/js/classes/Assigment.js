'use strict'

import Queston from './Queston'

export default class Assigment {
	constructor(queston, answers, solution) {
		if(!(queston instanceof Queston)){
			throw new TypeError("While creating Assigment: class of queston expected to be: Queston, instead got: " + queston.constructor.name)
		}
		if(!(answers instanceof Array)){
			throw new TypeError("While creating Assigment: class of answers expected to be: Array, instead got: " + answers.constructor.name)
		}
		if(!(solution instanceof Array)){
			throw new TypeError("While creating Assigment: class of solution expected to be: Array, instead got: " + solution.constructor.name)
		}
		
		this.queston = queston
		
		this.answers = answers
		
		this.solution = solution
	}
}
