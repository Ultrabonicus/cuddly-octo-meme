package mainmain

import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import akka.stream.scaladsl._
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.ws.UpgradeToWebsocket
import akka.http.scaladsl.model.ws.Message
import akka.http.scaladsl.model.ws.TextMessage
import mainmain._
import akka.http.scaladsl.server.ExpectedWebsocketRequestRejection
import akka.stream.OverflowStrategy
import scala.concurrent.Future
import scala.util. { Either,Left,Right }
import akka.actor.ActorRef
import akka.stream.ClosedShape
import akka.stream.actor.ActorPublisher
import akka.actor.Props
import scala.annotation.tailrec
import akka.http.scaladsl.unmarshalling.Unmarshaller
import akka.http.scaladsl.model.headers._
import akka.http.scaladsl.unmarshalling.Unmarshal
import spray.json._
import mainmain.Model.NewQuiz
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import akka.http.scaladsl.server.Directives
import scala.concurrent.Await
import mainmain.actors.supervisorActor.SupervisorMessages.InitializeUsers
import akka.http.scaladsl.server.directives.DebuggingDirectives
import akka.event.Logging
import mainmain.actors.supervisorActor.Supervisor
import mainmain.actors.userActor.EndpointPublisher
import mainmain.actors.masterActor.MasterEndpointPublisher
import akka.http.scaladsl.marshalling.Marshal
import scala.concurrent.ExecutionContext
import akka.stream.Materializer


object Main extends App with Routes with BasicServices {


  
	import HttpMethods._
	
	Http().bindAndHandle(requestHandler, "localhost",  8080)
}

object SprayImplicits extends SprayJsonSupport with DefaultJsonProtocol{
  import mainmain.Model._
  
  implicit val answerFormat = jsonFormat2(Answer.apply)
  implicit val questonFormat = jsonFormat2(Queston.apply)
  implicit val assigmentFormat = jsonFormat3(Assigment.apply)
  implicit val quizFormat = jsonFormat2(Quiz.apply)
  implicit val newQuizFormat = jsonFormat1(NewQuiz.apply)
  implicit val userFormat = jsonFormat2(User.apply)
  implicit val userAnswerFormat = jsonFormat2(FilledUserAnswer.apply)
  implicit val userAssigmentFormat = jsonFormat2(UserAssigment.apply)
  implicit val userQuizFormat = jsonFormat2(UserQuiz.apply)
  implicit val actionFormat = jsonFormat1(Action.apply)
  implicit val newQuizIdFormat = jsonFormat1(NewQuizId.apply)
}

trait WSFlows{
  
  import mainmain.Model._
  
  import SprayImplicits._
  
  def endpointMasterActorProvider(supervisor: Int)(implicit asystem: ActorSystem, materializer: Materializer):Flow[Message,Message,Any] = {
	  
    import materializer.executionContext
    
	  val endpointActor:ActorRef = asystem.actorFor("user/Supervisor" + supervisor + "/MasterActor/MasterEndpoint")
	  
	  def masterWSGraph = FlowGraph.create() { implicit builder: FlowGraph.Builder[Unit] =>
	    import FlowGraph.Implicits._
	    import akka.stream.SinkShape
	    import scalaz.{\/,\/-,-\/}
	    import mainmain.actors.masterActor.MasterEndpointMessages._
	    
	    val actorSink = builder.add(Sink.actorRef[EndpointMasterMessage](endpointActor, EndpointMasterComplete))
	    import scala.concurrent.duration._
    	val dur = Duration(10, SECONDS)
    	val flowGetLoad = builder.add(Flow[Message].map[\/[WSFailure,String]] {
    		case TextMessage.Strict(str) => \/-(str)
    		case tm:TextMessage => {
    		  val awaitable = tm.textStream
    		        .grouped(Int.MaxValue)
    		        .runWith[Future[String]](Sink.fold[String,Seq[String]]("")((acc, x) => acc ++ x.flatten))
    		  \/-(Await.result(awaitable, dur))
    		  }
    		case z:Any => -\/(WSFailure("Unsupported message format"))
    	})
	    def tryParseJson(jsvalue: JsValue):EndpointMasterMessage = {
    	  import scala.util.{Try,Success,Failure}
    	  Try[EndpointMasterMessage](EndpointMasterAction(jsvalue.convertTo[Action])).getOrElse(WSFailure("can't parse WS load"))
    	}
    	val flowParseJson = builder.add(Flow[\/[WSFailure,String]]
	      .map[EndpointMasterMessage](x => x.map { z => tryParseJson(z.parseJson) }.fold((v => v), (t => t))))
    	
      flowGetLoad ~> flowParseJson ~> actorSink
	    SinkShape(flowGetLoad.inlet)
	  }
	  val readerRef:Source[Message,ActorRef] = Source.actorPublisher(MasterEndpointPublisher.props(supervisor))

	  val wsFlow: Flow[Message,Message,Unit] = Flow.fromSinkAndSource(masterWSGraph, readerRef)

	  wsFlow
	}
  
  def endpointActorProvider(supervisor: Int, id: Int)(implicit asystem: ActorSystem, materializer: Materializer):Flow[Message,Message,Any] = {
	  
    import materializer.executionContext
    
  	val endpointActor:ActorRef = asystem.actorFor("user/Supervisor" + supervisor + "/Worker" + id + "/EndpointActor")
	  
  	def clientWSGraph = FlowGraph.create() { implicit builder: FlowGraph.Builder[Unit] =>
    	import FlowGraph.Implicits._
    	import akka.stream.SinkShape
    	import scalaz.{\/,\/-,-\/}
    	import mainmain.actors.userActor.EndpointActorMessage._
		
		
    	val actorSink = builder.add(Sink.actorRef[EndpointMessage](endpointActor, EndpointComplete))
    	import scala.concurrent.duration._
    	val dur = Duration(10, SECONDS)
    	val flowGetLoad = builder.add(Flow[Message].map[\/[WSFailure,String]] {
    		case TextMessage.Strict(str) => \/-(str)
    		case tm:TextMessage => {
    		  val awaitable = tm.textStream
    		        .grouped(Int.MaxValue)
    		        .runWith[Future[String]](Sink.fold[String,Seq[String]]("")((acc, x) => acc ++ x.flatten))
    		  \/-(Await.result(awaitable, dur))
    		  }
    		case z:Any => -\/(WSFailure("Unsupported message format"))
    	})
    	
    	def tryParseJson(jsvalue: JsValue):EndpointMessage = {
    	  import scala.util.{Try,Success,Failure}
    	  Try[EndpointMessage](EndpointFilledUserAnswers(jsvalue.convertTo[Seq[FilledUserAnswer]])).getOrElse(WSFailure("can't parse WS load"))
    	}
    	val flowParseJson = builder.add(Flow[\/[WSFailure,String]]
	      .map[EndpointMessage](x => x.map { z => tryParseJson(z.parseJson) }.fold((v => v), (t => t))))
	          
	    flowGetLoad ~> flowParseJson ~> actorSink
	    SinkShape(flowGetLoad.inlet)
		
    }
  	
	  val readerRef:Source[Message,ActorRef] = Source.actorPublisher(EndpointPublisher.props(supervisor,id))

	  val wsFlow: Flow[Message,Message,Unit] = Flow.fromSinkAndSourceMat(clientWSGraph, readerRef)(Keep.none)

	  wsFlow
	}
  
}

trait GenericServices {
  implicit def asystem: ActorSystem
  
  implicit def ec: ExecutionContext
  
  implicit def mat: Materializer
}

trait BasicServices extends GenericServices {
  implicit val asystem = ActorSystem("MySystem")
	
  implicit val mat: Materializer = ActorMaterializer()
  
  implicit val ec = mat.executionContext
}

trait Routes extends Directives with WSFlows with GenericServices{

  import mainmain.Model._
  
  import SprayImplicits._
  
  val requestHandler = DebuggingDirectives.logRequest("request", Logging.InfoLevel) {	
    pathSingleSlash {
			get {
				getFromResource("user.html")
			}
		} ~
		masterRoute ~
		userRoute ~
		assetsRoute
	}
  
  val assetsRoute = {
	  pathPrefix("assets") {
	    getFromDirectory("target/web/public")
	  }
	}
  
  var supervisors: List[ActorRef] = List.empty
  
  val masterRoute = {
	  path("master"){
	    post {
	      entity(as[NewQuiz]){ newQuiz =>
	        val newSupervisorActor = asystem.actorOf(Supervisor.props,Supervisor.name + (supervisors.length + 1).toString())
	        supervisors = newSupervisorActor :: supervisors
	        newSupervisorActor ! InitializeUsers(newQuiz)
	            complete(StatusCodes.Accepted -> NewQuizId(supervisors.length))
	      }
	    } ~
	    get {
	      getFromResource("master.html")
	    }
	  } ~
	  path("master" / IntNumber) { int1 =>
	    get { 
	      handleWebsocketMessages(endpointMasterActorProvider(int1)(asystem,mat))
	    }
	  }
	}
	
	val userRoute = {
	  path("user" / IntNumber / IntNumber) { (int1, int2) =>
			get {
		    handleWebsocketMessages(endpointActorProvider(int1,int2))
			}
		}	
	}
}

object Model{
  case class NewQuizId(quizId:Int)
  case class NewQuiz(quizes:Seq[Quiz]) extends MasterMessage
  case class User(name:String, secondName:String)
  case class Tests(users: Seq[User],tests:Seq[NewQuiz])
	case class Queston(id:Int,content: String)
	case class Answer(id: Int, content:String)
	case class Assigment(queston: Queston, answers:Seq[Answer], solution: Seq[Int]){
		def toUserAssigment:UserAssigment = UserAssigment(queston,answers)
	}
	case class Quiz(id:Int, assigments:Seq[Assigment]){
		def toUserQuiz:UserQuiz = UserQuiz(id,assigments.map {_.toUserAssigment})
	}
	
	trait MasterMessage
	case class Action(code:Int) extends MasterMessage
	case class AnswerStatus(id:Int, right:Int, outOf:Int, filledUserAnswer:Option[FilledUserAnswer])
	case class QuizAnswerStatus(userId:Int, status:Seq[AnswerStatus]) 
	case class QuizAnswerStatusSeq(statusSeq: Seq[QuizAnswerStatus]) extends MasterMessage
	case class NewQuizStatus(quizAnswerStatus: QuizAnswerStatus)
	
	trait UserMessage
	case class UserQuiz(id:Int, assigments: Seq[UserAssigment]) extends UserMessage
	case class UserAssigment(queston: Queston, answers:Seq[Answer])
	case class FilledUserAnswer(queston:Int, answer:Seq[Int]) extends UserMessage
	case class FilledUserAnswers(uanswers: Seq[FilledUserAnswer]) extends UserMessage
	case class FilledMessagesAck(listOfAck: Seq[Int]) extends UserMessage
}
  
