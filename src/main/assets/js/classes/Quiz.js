'use strict';

export default class Quiz {
	constructor(id, assigments) {
		if(!(typeof id === "number")){
			throw new TypeError("While creating Quiz: type of id expected to be: number, instead got: " + id.constructor.name)
		}
		if(!(assigments instanceof Array)){
			throw new TypeError("While creating Quiz: class of assigments expected to be: Array, instead got: " + assigments.constructor.name)
		}
		
		this.id = id
		
		this.assigments = assigments
		
	}
}