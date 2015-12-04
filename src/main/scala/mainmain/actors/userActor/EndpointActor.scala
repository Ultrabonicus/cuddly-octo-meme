package mainmain.actors.userActor

import akka.actor.Actor
import akka.actor.Props
import akka.actor.ActorLogging
import mainmain.Model._
import akka.actor.ActorRef
import mainmain.actors.userActor.EndpointPublisherMessages._
import akka.actor.actorRef2Scala

object EndpointActorMessage{
  trait EndpointMessage
  case object Start
  
  case class WSFailure(msg:String) extends EndpointMessage
  
  case class EndpointUserQuiz(uquiz: UserQuiz)
  
  case class EndpointFilledUserAnswers(uanswers: Seq[FilledUserAnswer]) extends EndpointMessage
  
  case object EndpointRegisterPublisher
  
  case object EndpointPull
  
  case object EndpointComplete
  
  case class EndpointFilledAnswersAck(questons:Seq[Int])

}

object EndpointActor{
  val name = "EndpointActor"
  def props(id: Int): Props = Props(classOf[EndpointActor], id)
}

class EndpointActor(id: Int) extends Actor with ActorLogging {
  
  import mainmain.actors.userActor.EndpointActorMessage._
  
  import mainmain.actors.userActor.WorkerMessages._
  
  log.info("created endpointActor here")
  
  val initial: Receive = {
    case Start => context.become(startedWithoutWS)
    
    case EndpointComplete => log.error("Endpoint complete requested before initialization")

    case x:Any => log.error("unhandled message: " + x)
  }
  
  val startedWithoutWS: Receive = {
    case EndpointUserQuiz(quiz) => log.info("got EndpointUserQuiz before connection")//; context.parent ! quiz
    
    case EndpointComplete => log.info("canceled WS connection before it created")

    case EndpointRegisterPublisher => log.info("register publisher message"); context.become(startedWS(sender)); self ! EndpointPull
        
    case x:Any => log.error("unexpected message after start without WS connection: " + x)
  }
  
  def startedWS(publisher:ActorRef): Receive = {
    case EndpointPull => context.parent ! WorkerPull

    case EndpointUserQuiz(quiz) => publisher ! WSPublish(quiz); context.parent ! WorkerPullFilledUserAnswers
    
    case EndpointFilledUserAnswers(uanswers) => log.info("received Filled user answers from: " + sender.path); if(context.parent.equals(sender)){
      publisher ! uanswers
    } else {
      context.parent ! WorkerFilledUserAnswers(uanswers); log.info("sending user answers to worker") // TODO
    }
    
    case EndpointFilledAnswersAck(x) => publisher ! WSPublish(FilledMessagesAck(x))
    
    case EndpointComplete => log.info("stopped WS connection") ;context.become(startedWithoutWS)
    
    case WSPublished => log.info("received WSPublished")
    
    case WSAccepted => log.info("received WSAccepted")
    
    case x:Any => log.error("unexpected message with connected WS: " + x)
  }
  
  var receive: Receive = initial
}