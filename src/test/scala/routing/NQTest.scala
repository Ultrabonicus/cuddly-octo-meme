package routing

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

class NQTest {
  
}