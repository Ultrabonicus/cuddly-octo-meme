name := "akkastreams"

version := "0.0.1"

resolvers += "Typesafe Releases" at "http://repo.typesafe.com/typesafe/releases/"

scalaVersion := "2.11.7"

scalacOptions in Test ++= Seq("-Yrangepos")

val akkahttpVersion = "2.0-M2"

libraryDependencies ++= Seq(
	"com.typesafe.akka" % "akka-stream-experimental_2.11" % akkahttpVersion,
	"com.typesafe.akka" % "akka-http-core-experimental_2.11" % akkahttpVersion,
	"com.typesafe.akka" %% "akka-http-experimental" % akkahttpVersion,
	"com.typesafe.akka" %% "akka-http-xml-experimental" % akkahttpVersion,
	"com.typesafe.akka" %% "akka-http-spray-json-experimental" % akkahttpVersion,
	"org.scala-lang.modules" % "scala-xml_2.11" % "1.0.5",
	"org.scalaz" %% "scalaz-core" % "7.1.3",
	"org.specs2" %% "specs2-core" % "3.6.5" % "test",
	"org.specs2" %% "specs2-junit" % "3.6.5" % "test",
	"com.typesafe.akka" %% "akka-testkit" % "2.3.12" % "test",
	"org.scalatest" % "scalatest_2.11" % "2.2.4" % "test",
	"junit" % "junit" % "4.8.1" % "test",
	"com.typesafe.akka" %% "akka-http-testkit-experimental" % akkahttpVersion % "test"
)