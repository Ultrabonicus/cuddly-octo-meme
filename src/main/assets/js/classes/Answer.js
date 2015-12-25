'use strict';

export default class Answer {
	constructor(id, content) {
		if(!(typeof id === "number")){
			throw new TypeError("While creating Answer: type of id expected to be: number, instead got: " + id.constructor.name)
		}
		if(!(typeof content === "string")){
			throw new TypeError("While creating Answer: type of content expected to be: string, instead got: " + content.constructor.name)
		}
		
		this.id = id
		
		this.content = content
	}
}