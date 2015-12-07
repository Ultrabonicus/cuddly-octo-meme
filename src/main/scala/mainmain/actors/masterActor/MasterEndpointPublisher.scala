package mainmain.actors.masterActor

import akka.stream.actor.ActorPublisher
import akka.actor.Props
import akka.actor.ActorLogging
import akka.actor.Actor
import mainmain.Model._
import spray.json._
import akka.http.scaladsl.model.ws.TextMessage
import akka.stream.actor.ActorPublisherMessage

object MasterEndpointPublisherMessages {
  	final case class WSMPublish(msg: MasterMessage)
	  case object WSMPublished
	  case object WSMDenied
	  case object WSMAccepted
}

object MasterEndpointPublisher {
	  def props(supervisor: Int): Props = Props(classOf[MasterEndpointPublisher], supervisor)
}


class MasterEndpointPublisher(supervisor:Int) extends Actor with ActorPublisher[TextMessage] with ActorLogging with DefaultJsonProtocol{
  
  import MasterEndpointMessages._
  import MasterEndpointPublisherMessages._
  import akka.stream.actor.ActorPublisherMessage._
  
  val endpointActor = context.system.actorFor("user/Supervisor" + supervisor + "/MasterActor/MasterEndpoint")
	  
	endpointActor ! EndpointMasterRegisterPublisher(context.self)
	  
	log.info("created MasterEndpointPublisher for supervisor: " + supervisor + " master endpoint")
  
	implicit val answerFormat = jsonFormat2(Answer.apply)
  implicit val questonFormat = jsonFormat2(Queston.apply)
  implicit val assigmentFormat = jsonFormat3(Assigment.apply)
  implicit val quizFormat = jsonFormat2(Quiz.apply)
  implicit val newQuizFormat = jsonFormat1(NewQuiz.apply)
  implicit val userFormat = jsonFormat2(User.apply)
  implicit val userAssigmentFormat = jsonFormat2(UserAssigment.apply)
  implicit val userQuizFormat = jsonFormat2(UserQuiz.apply)
	implicit val filledUserAnswerFormat = jsonFormat2(FilledUserAnswer.apply)
	implicit val answerStatusFormat = jsonFormat4(AnswerStatus.apply)
	implicit val quizAnswerStatusFormat = jsonFormat2(QuizAnswerStatus.apply)
	implicit val quizAnswerStatusSeqFormat = jsonFormat1(QuizAnswerStatusSeq.apply)
  implicit val actionFormat = jsonFormat1(Action.apply)
	
	var buf:List[MasterMessage] = List.empty
	
  def receive = {
	   case WSMPublish(msg) => log.info("wspblsh")
	     if (buf.isEmpty && totalDemand > 0){
	       sender() ! WSMPublished
	       onNext(parseJson(msg))
	     } else { 
	       sender() ! WSMAccepted
	       buf = buf ++ List(msg)
	     }
	   case Request(_) =>
	     if(!buf.isEmpty){
	       log.info("Sending from buffer")
	       onNext(parseJson(buf.head))
	       buf = buf.tail
	     }
	   case Cancel =>
	       context.stop(self)
	  }
	  
	  import scala.util.{Try,Success,Failure}
	  
	  def parseJson(message:MasterMessage):TextMessage = {
	    // TODO
	    message match {
	      case action:Action => {
	        log.info("Sending action '" + action.code + "' to client")
	        case class ActionWS(load:Action ,code:Int)
	        implicit val actionWSFormat = jsonFormat2(ActionWS.apply)
	        val jsobject = ActionWS(action, 1101)
	        TextMessage(jsobject.toJson.compactPrint)
	      }
	      
	      case quizStatusSeq:QuizAnswerStatusSeq => {
	        log.info("Sending StatusSeq to client")
	        case class QuizAnswerStatusWS(load:QuizAnswerStatusSeq ,code:Int)
	        implicit val quizWSFormat = jsonFormat2(QuizAnswerStatusWS.apply)
	        val jsobject = QuizAnswerStatusWS(quizStatusSeq, 1103)
	        TextMessage(jsobject.toJson.compactPrint)
	      }
	    
	      case newQuiz:NewQuiz => {
	        log.info("Sending NewQuiz to client")
	        case class NewQuizWS(load:NewQuiz ,code:Int)
	        implicit val quizWSFormat = jsonFormat2(NewQuizWS.apply)
	        val jsobject = NewQuizWS(newQuiz, 1102)
	        TextMessage(jsobject.toJson.compactPrint)
	      }
	    }
	  }
  
}