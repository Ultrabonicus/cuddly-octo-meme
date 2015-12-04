package mainmain.actors.supervisorActor

import akka.actor.Actor
import akka.stream.scaladsl._
import akka.actor.Props
import akka.actor.ActorLogging
import mainmain.actors.userActor.WorkerMessages._
import akka.actor.ActorRef
import mainmain.Model._
import akka.actor.PoisonPill
import mainmain.actors.userActor.Worker
import mainmain.actors.masterActor.MasterActor
import mainmain.actors.masterActor.MasterActorMessages.MasterQuizStatus

object SupervisorMessages {
	case class InitializeUsers(newQuiz: NewQuiz)
	case object NothingToInitialize
	case object Initialized
	
	// worker answers
	case class SupervisorWorkerStatus(nqstatus: QuizAnswerStatus)
	case class SupervisorCompleteWorkerStatus(nqstatus: QuizAnswerStatus)
	case object SupervisorWorkerFinish
	
	// master requests
	case object SupervisorGetFullStatus
  case object SupervisorFinish
}

object Supervisor {
	val props = Props[Supervisor]
	val name = "Supervisor"
}

class Supervisor extends Actor with ActorLogging {
	import SupervisorMessages._
	
//	var userActors:Seq[(Quiz,ActorRef)] = Seq.empty
	
	log.info("created Supervisor")
	
	def initial:Receive = {
		case InitializeUsers(newQuiz) => {
			if (newQuiz.quizes.isEmpty) {
				sender ! NothingToInitialize
			} else {
				val quiz:Seq[(Quiz,ActorRef)] = newQuiz.quizes.map { x => (x, context.actorOf(Worker.props(x.id), Worker.name + x.id)) }
				quiz.foreach(x => x._2 ! StartQuiz(x._1))
				val masterActor = context.actorOf(MasterActor.props,MasterActor.name)
				context.become(started(quiz, masterActor, newQuiz)) 
			}
		}
	}
	
	def started(userActors: Seq[(Quiz,ActorRef)], masterActor: ActorRef, newQuiz: NewQuiz):Receive = {
	  case SupervisorGetFullStatus => {
	    log.info("requested all statuses")
	    userActors.foreach(x => x._2 ! WorkerStatus)
	    context.become(collectingAnswers(userActors, masterActor, userActors.map(x => x._2), Seq.empty, newQuiz))
	  }
	  
	  case SupervisorFinish => {
	    log.info("requested to finish"); self ! PoisonPill
	  }
	}
	
	def collectingAnswers(userActors: Seq[(Quiz,ActorRef)], masterActor: ActorRef, remaining:Seq[ActorRef], statusSeq:Seq[QuizAnswerStatus], newQuiz: NewQuiz):Receive = {
	  case SupervisorWorkerStatus(status) => {
	    log.info("requested worker status")
	    remaining.find { x => x.equals(sender) } match {
	      case Some(workerRef) => {
	        log.info("Received status from worker: " + sender.path)
	        val newRemaining = remaining.filterNot { x => x.equals(workerRef) }
	        if(newRemaining.isEmpty){
	          log.info("sending status to master")
	          masterActor ! MasterQuizStatus(statusSeq.+:(status))
	          context.become(started(userActors, masterActor, newQuiz))
	        } else {
	          context.become(collectingAnswers(userActors, masterActor, newRemaining, statusSeq.+:(status), newQuiz))
	        }
	      }
	      case None => log.error("Received worker status from wrong actor")
	    }
	  }
	}
	
	var receive:Receive = initial 
}