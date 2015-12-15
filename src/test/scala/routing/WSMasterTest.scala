package routing

import akka.testkit.TestKit
import akka.actor.ActorSystem
import akka.testkit.ImplicitSender
import akka.testkit.TestProbe
import mainmain.actors.userActor.Worker
import mainmain._
import akka.testkit.TestKitBase
import scala.concurrent.duration._
import mainmain.actors.userActor.WorkerMessages._
import mainmain.Model._
import akka.http.scaladsl.testkit.ScalatestRouteTest
import akka.http.scaladsl.server._
import akka.http.scaladsl.model.StatusCodes
import mainmain.Routes
import mainmain.BasicServices
import akka.http.scaladsl.testkit.WSProbe
import org.scalatest.WordSpec
import org.scalatest.Matchers
import akka.stream.Materializer
import akka.stream.ActorMaterializer
import org.scalatest.BeforeAndAfterAll
import akka.http.scaladsl.model.ws.TextMessage
/* ********** http-testkit not working properly for now *********
class WSMasterTest extends WordSpec with Matchers
            with ScalatestRouteTest with BeforeAndAfterAll {
  
  
  import spray.json._
  import mainmain.SprayImplicits._
  
  import cont._
  
  val rh =  mainmain.Main.requestHandler
  
  val wsClient = WSProbe()
  
  
  "WS" should "get jsonNewQuiz message".in {
  WS("/master", wsClient.flow) ~> rh ~> 
    check {
      isWebsocketUpgrade shouldEqual(true)
      
      wsClient.sendMessage(TextMessage(Action(1).toJson.compactPrint))
      wsClient.expectMessage(jsonNQuiz)
      
    }  
  }
  
  
  
  override def beforeAll = {
    Post("/master", jsonNQuiz) ~> rh
    
  }
    
  
//  import cont._
  
  object cont {
    val jsonNQuiz: String = """ 
      "{"quizes":[{"id":1,"assigments":[{"queston":{"id":0,"content":"queston1123"},"solution":[2,3],"answers":[{"id":1,"content":"fghfghf"},{"id":2,"content":"fgnbvn"},{"id":3,"content":"rty"},{"id":4,"content":"rty"},{"id":5,"content":"rtyrt"},{"id":6,"content":"rtyfgh"}]},{"queston":{"id":1,"content":"queston11534"},"solution":[4,5,6],"answers":[{"id":1,"content":"fgfh"},{"id":2,"content":"fghfg"},{"id":3,"content":"fgh"},{"id":4,"content":"fghgf"},{"id":5,"content":"fghfgh"},{"id":6,"content":"fghfgrt"}]}]},{"id":2,"assigments":[{"queston":{"id":0,"content":"que1"},"solution":[2],"answers":[{"id":1,"content":"qwe"},{"id":2,"content":"qwe"},{"id":3,"content":"asd"},{"id":4,"content":"zxc"}]},{"queston":{"id":1,"content":"que2"},"solution":[3],"answers":[{"id":1,"content":"qweqwe"},{"id":2,"content":"sadasd"},{"id":3,"content":"qweqw"},{"id":4,"content":"asdasd"}]},{"queston":{"id":2,"content":"que3"},"solution":[4],"answers":[{"id":1,"content":"qweawd"},{"id":2,"content":"qweqw"},{"id":3,"content":"sdqwe"},{"id":4,"content":"sadqwe"}]}]}]}"
       """
  }
  
}
*/