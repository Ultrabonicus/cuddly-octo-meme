package mainmain.actors.masterActor

import akka.actor.Actor
import akka.stream.scaladsl._
import akka.actor.Props
import akka.actor.ActorLogging
import mainmain.Model._
import mainmain.actors.masterActor.MasterEndpointMessages._
object MasterActorMessages{
  
  
  case class MasterQuizStatus(statusSeq: Seq[QuizAnswerStatus])
  
  case class MasterNewQuiz(nquiz: NewQuiz)
  
  //actions without payload
  case object MasterGetAll //1
  
  case object MasterFinish //2
//  case object Start
  
}

object MasterActor{
  
  def props = Props(classOf[MasterActor])
	
  val name = "MasterActor"
  
}

class MasterActor extends Actor with ActorLogging {
  import MasterActorMessages._
  import mainmain.actors.supervisorActor.SupervisorMessages._
  
  log.info("Created MasterActor")
  
  val masterEndpoint = context.actorOf(MasterEndpointActor.props, MasterEndpointActor.name)
  
  val started:Receive = {
    case MasterGetAll => context.parent ! SupervisorGetFullStatus
    
    case MasterFinish => context.parent ! SupervisorFinish
    
    case MasterQuizStatus(statusSeq) => masterEndpoint ! EndpointMasterQuizStatus(statusSeq)
    
    case a => log.error("unexpected msg after start: " + a)
  }
 /* 
  val initial:Receive = {
    case a => ???
  }
 */
  
  var receive = started
}