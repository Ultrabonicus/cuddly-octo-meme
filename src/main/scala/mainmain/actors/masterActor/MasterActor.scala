package mainmain.actors.masterActor

import akka.actor.Actor
import akka.stream.scaladsl._
import akka.actor.Props
import akka.actor.ActorLogging
import mainmain.Model._
import mainmain.actors.masterActor.MasterEndpointMessages._
import akka.actor.ActorRef
object MasterActorMessages{
  
  
  case class MasterQuizStatus(statusSeq: Seq[QuizAnswerStatus])
  
  case class MasterNewQuiz(nquiz: NewQuiz)
  
  //actions without payload
  case object MasterGetAll //1
  
  case object MasterFinish //2
  
  case object MasterGetNewQuiz
  
}

object MasterActor{
  
  def props = Props(classOf[MasterActor])
	
  val name = "MasterActor"
  
}

trait GenericMasterEndpointActorPropsProvider {
  def masterEndpointName: String
  def masterEndpointProps: Props
  val masterEndpoint: ActorRef
  
}

sealed trait EndpointMasterActorPropsProvider extends GenericMasterEndpointActorPropsProvider{
  val masterEndpointName: String = MasterEndpointActor.name
  def masterEndpointProps: Props = MasterEndpointActor.props
  
}

class MasterActor extends GenericMasterActor with EndpointMasterActorPropsProvider {
  val masterEndpoint = context.actorOf(MasterEndpointActor.props, MasterEndpointActor.name)
}

abstract class GenericMasterActor extends Actor with ActorLogging with GenericMasterEndpointActorPropsProvider{
  import MasterActorMessages._
  import mainmain.actors.supervisorActor.SupervisorMessages._
  
  log.info("Created MasterActor")    
  
  val started:Receive = {
    
    //user messages
    
    case MasterGetAll => context.parent ! SupervisorGetFullStatus
    
    case MasterFinish => context.parent ! SupervisorFinish
    
    case MasterGetNewQuiz => context.parent ! SupervisorGetNewQuiz
    
    //supervisor messages
    
    case MasterNewQuiz(nquiz) => masterEndpoint ! EndpointMasterNewQuiz(nquiz)
    
    case MasterQuizStatus(statusSeq) => masterEndpoint ! EndpointMasterQuizStatus(statusSeq)
    
    case a => log.error("unexpected msg after start: " + a)
  }
  
  var receive = started
}