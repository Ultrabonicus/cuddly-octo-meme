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
import mainmain.actors.userActor._
import akka.testkit.TestActor
import akka.actor.Actor
import akka.actor.Props
import mainmain.actors.userActor.EndpointActorMessage._
import mainmain.actors.supervisorActor.SupervisorMessages.SupervisorWorkerStatus



@RunWith(classOf[JUnitRunner])
class WorkerTest extends TestKit(ActorSystem("ClientTest")) with SpecificationLike
	with NoTimeConversions with AfterAll with ImplicitSender {
	
		import cont._
	
		sequential ^
		"worker should " >> {
			"initiate" >> {
				val assigments = List(
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
				supervisorProbe.send(worker, StartQuiz(Quiz(1, assigments)) )
				within(FiniteDuration(2,SECONDS)) {
					endpointProbe.receiveOne(max = FiniteDuration(1,SECONDS)) match {
						case Start => true
						case _ => false
					}
				}
			}
			"accept filled questions " >> {
				val fa = FilledUserAnswer(1,Seq(2))
				endpointProbe.send(worker, WorkerFilledUserAnswers(Seq(fa)))
				within(FiniteDuration(2,SECONDS)) {
					endpointProbe.receiveOne(FiniteDuration(1,SECONDS)) match {
						case EndpointFilledAnswersAck(x) =>  if (x == Seq(1)) true else false
						case _ => false
					}
				}
			}
			"Send requested answers to Supervisor" >> {
				supervisorProbe.send(worker, WorkerStatus)
				within(FiniteDuration(3,SECONDS)){
					supervisorProbe.receiveOne(FiniteDuration(2,SECONDS)) match {
						case SupervisorWorkerStatus(quas) => quas match {
						  case QuizAnswerStatus(id,answerStatus) => {
						    answerStatus.forall { x => x.id match {
						      
						      case 1 => x.filledUserAnswer.exists { z => z.answer.head === 2 }
						        
						      case 2 => x.filledUserAnswer.isEmpty
						    
						    }}
						  }
						}  
					}
				}
			}
		}
	
	def afterAll = shutdown(system)
	
	object cont {
	  
	  val endpointProbe = TestProbe()
	  
	  val supervisorProbe = TestProbe()
	  
	  class TestProbeForwarderActor(id:Int) extends Actor {
	    def receive:Receive = {
	      case x:Any =>  endpointProbe.ref forward x 
	    }
	  }
	  
	  sealed trait TestEndpointPropsProvider extends GenericEndpointActorPropsProvider {
	    val endpointName = "TestEndpoint"
	    def endpointProps:Int => Props = x => Props(new TestProbeForwarderActor(x))
	  }
	  
	  class TestWorker(id:Int) extends GenericWorker(id) with TestEndpointPropsProvider
	  
	  val worker = system.actorOf(Props.apply(new TestWorker(1)), "Worker1")
	  
	}
	
}

