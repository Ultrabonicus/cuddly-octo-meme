package mainmain.actors.masterActor

import akka.actor.Actor
import akka.actor.Props
import akka.actor.ActorLogging
import mainmain.Model._
import akka.actor.ActorRef
import mainmain.actors.masterActor.MasterEndpointPublisherMessages._
import mainmain.actors.masterActor.MasterActorMessages._
import akka.actor.actorRef2Scala

object MasterEndpointMessages {
  
  case class EndpointMasterRegisterPublisher(publisherRef: ActorRef)

  case object EndpointMasterComplete
  
  case class EndpointMasterNewQuiz(nquiz: NewQuiz)
  
  case class EndpointMasterQuizStatus(statusSeq: Seq[QuizAnswerStatus])
  
  // from ws messages
  trait EndpointMasterMessage
  
  case class WSFailure(msg:String) extends EndpointMasterMessage
  
  case class EndpointMasterAction(action: Action) extends EndpointMasterMessage
  
  // Endpoint action Acks
  trait EndpointMasterActionAck
  
  case object EndpointMasterActionGetAllAck extends EndpointMasterActionAck
  
  case object EndpointMasterActionFinishAck extends EndpointMasterActionAck
}

object MasterEndpointActor{
  def props = Props(classOf[MasterEndpointActor])
  
  val name = "MasterEndpoint"
}

class MasterEndpointActor extends Actor with ActorLogging {
  import MasterEndpointMessages._
  import MasterActorMessages._
  import MasterEndpointPublisherMessages._
  
  log.info("created MasterEndpoint")
  
  val startedWithoutWS:Receive = {
    case EndpointMasterRegisterPublisher(pref) => log.info("registering MasterPublisher") ; context.become(startedWS(pref))
  
    case a:Any => log.error("received unexpected message when not connted: " + a)
  }
    
  
  def startedWS(publisher: ActorRef):Receive = {
    case EndpointMasterComplete => log.info("WS disconnected"); context.become(startedWithoutWS)
    
    case EndpointMasterAction(action) => action.code match {
      case 1 => log.info("received MasterGetAll message") ; context.parent ! MasterGetAll
      
      case 2 => log.info("received MasterFinish message") ; context.parent ! MasterFinish
    }
    
    case x:EndpointMasterActionAck => x match {
      case EndpointMasterActionGetAllAck => log.info("sending MasterActionGetAllAck to publisher"); publisher ! WSMPublish(Action(1))
      
      case EndpointMasterActionFinishAck => log.info("sendiong MasterActionFinishAck to publisher"); publisher ! WSMPublish(Action(2))
    }
    
    case EndpointMasterQuizStatus(statusSeq) => log.info("sending quiz status to publisher"); publisher ! WSMPublish(QuizAnswerStatusSeq(statusSeq))

    case WSMPublished => log.info("message published")
    
    case WSMAccepted => log.info("message accepted")
    
    case WSMDenied => log.error("message denied")
    
    case any => log.error("Unexpected message with WS connection: " + any)
    
    
  }
  
  var receive = startedWithoutWS
}