package mainmain.actors.userActor

import akka.stream.actor.ActorPublisher
import akka.actor.Props
import akka.actor.ActorLogging
import akka.actor.Actor
import mainmain.Model._
import spray.json._
import akka.http.scaladsl.model.ws.TextMessage
import akka.actor.actorRef2Scala
import akka.stream.actor.ActorPublisherMessage
import mainmain.actors.userActor.EndpointActorMessage.EndpointRegisterPublisher
import scala.annotation.tailrec

object EndpointPublisherMessages {
  	final case class WSPublish(msg: UserMessage)
	  case object WSPublished
	  case object WSDenied
	  case object WSAccepted
}

object EndpointPublisher {
	  def props(supervisor: Int, id: Int): Props = Props(classOf[EndpointPublisher], supervisor, id)
}


class EndpointPublisher(supervisor:Int, id: Int) extends Actor with ActorPublisher[TextMessage] with ActorLogging with DefaultJsonProtocol {
	  import akka.stream.actor.ActorPublisherMessage._
	  import EndpointPublisherMessages._
	  
//	  val MaxBufferSize = 100
	  
	  val endpointActor = context.system.actorFor("user/Supervisor" + supervisor + "/Worker" + id + "/EndpointActor")
	  
	  endpointActor ! EndpointRegisterPublisher
	  
	  log.info("created endpointPublisher for supervisor: " + supervisor + " worker: " + id)
	  
	  implicit val answerFormat = jsonFormat2(Answer.apply)
    implicit val questonFormat = jsonFormat2(Queston.apply)
    implicit val assigmentFormat = jsonFormat3(Assigment.apply)
    implicit val userAnswer = jsonFormat2(UserAssigment.apply)
	  implicit val userQuizFormat = jsonFormat2(UserQuiz.apply)
	  implicit val filledUserAnswerFormat = jsonFormat2(FilledUserAnswer.apply)
	  implicit val filledMessagesAckFormat = jsonFormat1(FilledMessagesAck.apply)
	  
	  var buf:List[UserMessage] = List.empty
	  
	  def receive = {
	    case WSPublish(msg) => log.info("wspblsh " + msg)
	      if (buf.isEmpty && totalDemand > 0){
	        sender() ! WSPublished
	        onNext(parseJson(msg))
	      }
	      else { 
	        sender() ! WSAccepted
	        buf = buf.:+(msg)
	      }
	    case Request(_) =>
	      sendFromBuffer
	    case Cancel =>
	      context.stop(self)
	  }
	  
	  @tailrec final def sendFromBuffer:Unit = {
	    if (!buf.isEmpty && totalDemand > 0){
	      log.info("Sending from buffer")
	      onNext(parseJson(buf.head))
	      buf = buf.tail
	      sendFromBuffer
	    }
	  }
	  
	  import scala.util.{Try,Success,Failure}
	  
	  def parseJson(message:UserMessage):TextMessage = {
	    
	    message match {
	      case quiz:UserQuiz => {
	        log.info("Sending UserQuiz to client with code 2101"); 
	        case class QuizWS(load:UserQuiz ,code:Int)
	        implicit val quizWSFormat = jsonFormat2(QuizWS.apply)
	        val jsobject = QuizWS(quiz, 2101)
//	        val jsobject = JsObject.apply(quiz.toJson.asJsObject.fields+(("code",101.toJson.asJsObject)))
	        TextMessage(jsobject.toJson.compactPrint)
	      }
	      
	      case fmAck:FilledMessagesAck => {
	        log.info("Sending FilledMessagesAck to client with code 2202");
	        case class FmAckWS(load:FilledMessagesAck ,code:Int)
	        implicit val fmAckWSFormat = jsonFormat2(FmAckWS.apply)
	        val jsobject = FmAckWS(fmAck, 2202)
//	        val jsobject = JsObject.apply(fmAck.toJson.asJsObject.fields+(("code",202.toJson.asJsObject)))
	        TextMessage(jsobject.toJson.compactPrint)
	      }
	      
	      case filledAnswers:FilledUserAnswers => {
	        log.info("sending FilledUserAnswer to client with code 2102");
	        case class FilledAnswersWS(load:Seq[FilledUserAnswer] ,code:Int)
	        implicit val filledAnswerFormat = jsonFormat2(FilledAnswersWS.apply)
	        val jsobject = FilledAnswersWS(filledAnswers.uanswers, 2102)
//	        val jsobject = JsObject.apply(filledAnswers.toJson.asJsObject.fields+(("code",102.toJson.asJsObject)))
	        TextMessage(jsobject.toJson.compactPrint)
	      }
	    }
/*	    Try(message.toJson) match {
	      case Success(s) => log.info("Sending quiz to client"); TextMessage(s.compactPrint)
	      case Failure(t) => log.error(t, "Failed at quiz parsing"); throw t
	    }*/
	  }
	  /*
	  @tailrec final def deliverBuf(): Unit =
	    if (totalDemand > 0) {
	      if (totalDemand <= Int.MaxValue) {
	        val (use,keep) = buf.splitAt(totalDemand.toInt)
	        buf = keep
	        use foreach onNext
	      } else {
	        val (use, keep) = buf.splitAt(Int.MaxValue)
	        buf = keep
	        use foreach onNext
	        deliverBuf()
	      }
	    }
	  */
	}