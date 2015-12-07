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
//import org.specs2.specification.AllExpectations
import mainmain._
import akka.testkit.TestKitBase
import scala.concurrent.duration._
import org.specs2.runner.JUnitRunner
import org.junit.runner.RunWith
import mainmain.actors.userActor.WorkerMessages._
import mainmain.Model._


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
				probe.send(worker, Quiz(1, assigments))
				within(2.seconds) {
					probe.receiveOne(max = 1.seconds) match {
						case UserQuiz(_,_) => true
						case _ => false
					}
				}
			}
			"accept filled questions " >> {
				val fa = FilledUserAnswer(1,Seq(2))
				probe.send(worker, fa)
				within(2.seconds) {
					probe.receiveOne(1.seconds) match {
						case FilledMessagesAck(x) => if (x == List(1)) true else false
						case _ => false
					}
				}
				true
			}
/*			"And get result after Complete" >> {
				probe.send(worker, WorkerStatus)
				within(3.seconds){
					probe.receiveOne(2.seconds) match {
						case CompleteStatus(_,status) => println(status) ; status.contains(1,Some(true)) && status.contains(2,None) 
					}
				}
			}*/
		}
	
	def afterAll = shutdown(system)
	
	object cont {
		val probe = TestProbe()
		val worker = system.actorOf(Worker.props(1), Worker.name)
	}
	
}

