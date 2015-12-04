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

class SupervisorTest extends TestKit(ActorSystem("ClientTest")) with SpecificationLike
	with NoTimeConversions with AfterAll with ImplicitSender {
 	
		import cont._
		
		sequential ^
		"Supervisor should " >> {
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
			false
			
		}
		
		def afterAll = system.shutdown()
	
	
		object cont {
		val probe = TestProbe()
		val worker = system.actorOf(Worker.props(1), Worker.name)
	}
}