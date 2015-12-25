/*
  case class NewQuizId(quizId:Int)
  case class NewQuiz(quizes:Seq[Quiz]) extends MasterMessage
  case class User(name:String, secondName:String)
  case class Tests(users: Seq[User],tests:Seq[NewQuiz])
	case class Queston(id:Int,content: String)
	case class Answer(id: Int, content:String)
	case class Assigment(queston: Queston, answers:Seq[Answer], solution: Seq[Int]){
		def toUserAssigment:UserAssigment = UserAssigment(queston,answers)
	}
	case class Quiz(id:Int, assigments:Seq[Assigment]){
		def toUserQuiz:UserQuiz = UserQuiz(id,assigments.map {_.toUserAssigment})
	}
	
	trait MasterMessage
	case class Action(code:Int) extends MasterMessage
	case class AnswerStatus(id:Int, right:Int, outOf:Int, filledUserAnswer:Option[FilledUserAnswer])
	case class QuizAnswerStatus(userId:Int, status:Seq[AnswerStatus]) 
	case class QuizAnswerStatusSeq(statusSeq: Seq[QuizAnswerStatus]) extends MasterMessage
	case class NewQuizStatus(quizAnswerStatus: QuizAnswerStatus)
	
	trait UserMessage
	case class UserQuiz(id:Int, assigments: Seq[UserAssigment]) extends UserMessage
	case class UserAssigment(queston: Queston, answers:Seq[Answer])
	case class FilledUserAnswer(queston:Int, answer:Seq[Int]) extends UserMessage
	case class FilledUserAnswers(uanswers: Seq[FilledUserAnswer]) extends UserMessage
	case class FilledMessagesAck(listOfAck: Seq[Int]) extends UserMessage
*/

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
