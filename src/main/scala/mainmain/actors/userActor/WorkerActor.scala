package mainmain.actors.userActor

import akka.actor.Actor
import akka.stream.scaladsl._
import akka.actor.Props
import akka.actor.ActorLogging
import akka.actor.ActorRef
import mainmain.actors.supervisorActor.SupervisorMessages.SupervisorWorkerStatus
import akka.actor.actorRef2Scala
import mainmain.actors.userActor.EndpointActor._
import mainmain.actors.userActor.EndpointActorMessage._
import mainmain.Model
import mainmain.Model.AnswerStatus
import mainmain.Model.QuizAnswerStatus

object WorkerMessages {
  import mainmain.Model._

  case class StartQuiz(quiz:Quiz)
//	case class FilledAnswersAndComplete(answers: Seq[FilledUserAnswer]) TODO

  
  //supervisor messages
  case object WorkerFinish
  
	case object WorkerStatus

	//endpoint messages
	case object WorkerPull
	
	case object WorkerPullFilledUserAnswers
	
	case class WorkerFilledUserAnswers(answers:Seq[FilledUserAnswer])
	
//	case class CompleteStatus(quiz: Quiz, ansactors: Seq[(Int,Option[Boolean])])
}

object Worker {
	def props(id:Int) = Props(classOf[Worker],id)
	val name = "Worker"
}

class Worker(id:Int) extends Actor with ActorLogging {
	
	import WorkerMessages._
	import EndpointActorMessage._
	import mainmain.Model._
	
	log.info("created worker")
	
	val endpointActor:ActorRef = context.actorOf(EndpointActor.props(id),EndpointActor.name)
	
	// 	AnswerStatus(id:Int, right:Int, outOf:Int, filledUserAnswer:FilledUserAnswer)
	//  FilledUserAnswer(queston:Int, answer:Seq[Int])
	
	def working(quiz: Quiz, /*answers:Seq[FilledUserAnswer],*/ answersStatus: Seq[AnswerStatus]):Receive = {
		case WorkerFilledUserAnswers(userAnswers) => {
		  
		  val newAnswerStatus:Seq[AnswerStatus] = {
		    val nas = answersStatus.map { answerStatus =>
		      
		      userAnswers.find { x => x.queston == answerStatus.id } match {
		        case Some(userAnswer) => {
		          val assigment:Assigment = quiz.assigments.find { x => x.queston.id == answerStatus.id}.getOrElse({log.error("Can't find assigment for given id"); throw new NoSuchElementException}) 
		          val right:Int = assigment.solution.filter { x => userAnswer.answer.contains(x) }.length
		          val outOf:Int = assigment.solution.length
		          AnswerStatus(answerStatus.id,right, outOf,Some(userAnswer))
		        }
		        case None => answerStatus
		      }
		      
		    }
		    
		    nas
		  }
		  context.become(working(quiz, newAnswerStatus))
			sender ! EndpointFilledAnswersAck(newAnswerStatus.foldLeft[Seq[Int]](Seq.empty)((acc, x) => if(x.filledUserAnswer.isDefined) acc.+:(x.id) else acc))
		  /*
			val newAnswers:Seq[FilledUserAnswer] = userAnswers ++ answers.filter(x => userAnswers.find( z => x.queston == z.queston ).isEmpty)
		  val newStatus:Seq[AnswerStatus] = newAnswers
//	    .filter(ua => quiz.assigments.find(x => x.queston.id == ua.queston).isDefined)
		    .foldLeft[Seq[(Int,Boolean)]](Seq.empty){(acc, userAnswer) =>
		      quiz.assigments.find(x => x.queston.id == userAnswer.queston) match {  
		        case Some(x) => acc :+ (userAnswer.queston, x.solution == userAnswer.answer)
				
		        case None => acc
				  }
		    } 
				val assigment = quiz.assigments.reduceLeft[(Int,Boolean)]{ (acc, x) => 
				  x.queston.id == userAnswer.queston 
				  (userAnswer.queston, x.solution == userAnswer.answer) :: acc
				}
				assigment match {
			  		case Some(z) => 
			  		case None =>  log.error("Unsuitable answer in received FilledUserAnswers")//TODO s
 				}
			} */
			
		}
		//from supervisor
		case WorkerStatus => {
		  sender ! SupervisorWorkerStatus(QuizAnswerStatus(id,answersStatus))
		}
		//from endpoint
		case WorkerPull => {
		  sender ! EndpointUserQuiz(quiz.toUserQuiz)
		}
		//from endpoint
		case WorkerPullFilledUserAnswers => {
		  sender ! EndpointFilledUserAnswers(answersStatus.foldLeft[Seq[FilledUserAnswer]](Seq.empty){(acc,x) => 
		    x.filledUserAnswer match {
		      case Some(z) => acc.+:(z)
		      case None => acc
		    }})
		} 
	}
	
	val initial:Receive = {
		case StartQuiz(quiz) => {
		  log.debug("Received Quiz")
		  endpointActor ! Start 
		  context.become(working(quiz,quiz.assigments.map { x => AnswerStatus(x.queston.id,0,x.solution.length,None) }))
		}
		  
		case x:Any => log.info("unexpected msg before init " + x); sender ! "Something wrong"
	}
	
	var receive:Receive = initial
}