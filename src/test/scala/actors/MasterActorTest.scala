package actors

import akka.testkit.TestKit
import akka.actor.ActorSystem
import org.specs2.mutable.SpecificationLike
import akka.testkit.ImplicitSender
import org.specs2.mutable.After
import org.specs2.time.NoTimeConversions
import org.specs2.specification._
import akka.testkit.TestProbe
import mainmain.actors.userActor.Worker
import org.specs2.specification.Scope
import mainmain._
import akka.testkit.TestKitBase
import scala.concurrent.duration._
import org.specs2.runner.JUnitRunner
import org.junit.runner.RunWith
import mainmain.actors.userActor.WorkerMessages._
import mainmain.Model._
import mainmain.actors.masterActor.GenericMasterEndpointActorPropsProvider
import akka.actor.ActorRef
import akka.actor.Props
import mainmain.actors.masterActor.GenericMasterActor
import akka.actor.Actor
import mainmain.actors.masterActor.MasterActorMessages._
import mainmain.actors.supervisorActor.SupervisorMessages._
import mainmain.actors.masterActor.MasterEndpointMessages._
import akka.testkit.TestActorRef

class MasterActorTest extends TestKit(ActorSystem("ClientTest")) with SpecificationLike
	with NoTimeConversions with AfterAll with ImplicitSender {
 	
		import cont._
		
		sequential ^
	  	"MasterActor should " >> {
	  	  "Ask supervisor for user answers " >> {
		
	  		  masterEndpointProbe.send(masterActor, MasterGetAll)
			
	  		  within(FiniteDuration(2,SECONDS)) {
	  			  supervisorProbe.receiveOne(FiniteDuration(1,SECONDS)) match {
	  				  case SupervisorGetFullStatus =>  true
	  				  case _ => false
	  			  }
	  		  }
	  	  } 
	  	  "Forward NewQuiz from supervisor to endpoint" >> {
	  	    
	  	    supervisorProbe.send(masterActor, MasterNewQuiz(newQuiz))
	  	    
	  		  within(FiniteDuration(2,SECONDS)) {
	  			  masterEndpointProbe.receiveOne(FiniteDuration(1,SECONDS)) match {
	  				  case EndpointMasterNewQuiz(nquiz) =>  nquiz.## == newQuiz.##
	  				  case _ => false	 
	  			  }
	  		  }
	  	  }
	  	  "Forward QuizStatus from supervisor to endpoint" >> {
	  	    
	  	    supervisorProbe.send(masterActor, MasterQuizStatus(statusSeq))
	  	    
	  		  within(FiniteDuration(2,SECONDS)) {
	  			  masterEndpointProbe.receiveOne(FiniteDuration(1,SECONDS)) match {
	  				  case EndpointMasterQuizStatus(masterSeq) =>  statusSeq.## == masterSeq.##
	  				  case _ => false	 
	  			  }
	  		  }
	  	  }
	  	  "Forward GetNewQuiz from endpoint to supervisor" >> {
	  	    
	  	    masterEndpointProbe.send(masterActor, MasterGetNewQuiz)
	  	    
	  		  within(FiniteDuration(2,SECONDS)) {
	  			  supervisorProbe.receiveOne(FiniteDuration(1,SECONDS)) match {
	  				  case SupervisorGetNewQuiz =>  true
	  				  case _ => false	 
	  			  }
	  		  }
	  	  }
	  	  "Forward Finish request from endpoint to supervisor" >> {
	  	    
	  	    masterEndpointProbe.send(masterActor, MasterFinish)
	  	    
	  		  within(FiniteDuration(2,SECONDS)) {
	  			  supervisorProbe.receiveOne(FiniteDuration(1,SECONDS)) match {
	  				  case SupervisorFinish =>  true
	  				  case _ => false	 
	  			  }
	  		  }
	  	  }
		}
		
	def afterAll = system.shutdown()
	
	
	object cont {
		
	  val statusSeq: Seq[QuizAnswerStatus] = Seq(
	    QuizAnswerStatus(2,Seq(AnswerStatus(2,0,1,None))), 
	    QuizAnswerStatus(1,Seq(AnswerStatus(1,0,1,Some(FilledUserAnswer(1,Seq(1)))))))
	  
		val assigments1 = List(
				Assigment(
					Queston(1,"two is equals to"), 
					List(Answer(1,"one"),Answer(2,"two"),Answer(3, "three")),
					Seq(2)
					),
				Assigment(
					Queston(2, "three is more than five"),
					List(Answer(1,"Maybe"),Answer(2,"Yes"),Answer(3,"No")),
					Seq(3)
				)
			)
		val assigments2 = List(
				Assigment(
					Queston(1,"two is equals to"), 
					List(Answer(1,"one"),Answer(2,"two"),Answer(3, "three")),
					Seq(2)
					),
				Assigment(
					Queston(2, "three is more than five"),
					List(Answer(1,"Maybe"),Answer(2,"Yes"),Answer(3,"No")),
					Seq(3)
				)
			)
		
		val newQuiz = NewQuiz(Seq(Quiz(1,assigments1),Quiz(2,assigments2)))
		  
		val masterEndpointProbe = TestProbe()
		
		val supervisorProbe = TestProbe()
		
	  class TestProbeForwarderActor extends Actor {
	    def receive = {
	      case x:Any =>  masterEndpointProbe.ref forward x 
	    }
	  }
		
		class TestMasterActor extends GenericMasterActor with TestMasterPropsProvider{
		  val masterEndpoint: ActorRef = context.actorOf(masterEndpointProps, masterEndpointName)
		}
		
		sealed trait TestMasterPropsProvider extends GenericMasterEndpointActorPropsProvider {
		  def masterEndpointName = "MasterEndpoint"
      def masterEndpointProps = Props.apply(new TestProbeForwarderActor)
		}
		
		val masterActor = TestActorRef(Props(new TestMasterActor), supervisorProbe.ref, "TestMasterActor")
		
	}
}