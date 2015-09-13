var config = require('./config.json')
var https = require('https')
var Person = require('./Person.js')
var bodyParser = require("body-parser");
var express = require('express');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('static'))

var twilioSid = config["TWILIO_ACCOUNT_SID"]
var twilioAuth = config["TWILIO_AUTH_TOKEN"]
var googleDirectionKey = config["GOOGLE_DIRECTIONS_KEY"]
var expressPort = config["PORT"]

var client = require('twilio')(twilioSid, twilioAuth);

var fromNumber = config["TWILIO_NUMBER"]

var bTagRegex = /\\(u.{4}).*?\\u.{4}/gi;

var peopleMap = {}

var initiationPhrase = "give me directions";

var progressionPhrase = "next";

function getDirections(location, destination, callback){

	https.get('https://maps.googleapis.com/maps/api/directions/json?origin=' + encodeURI(location) + '&destination=' + encodeURI(destination) + '&key=' + googleDirectionKey, function(res){

		var body = ""
		res.on("data", function(data){
			body += data;
		})

		res.on("end", function(){
			callback(JSON.parse(body))
		})

	})
}

function initiate(number){
	return sendText(number, "Text '" + initiationPhrase + "' to get started")
}

function handleText(number, body){
	if(body.toLowerCase().indexOf(initiationPhrase) == 0){
		if(peopleMap[number])
			peopleMap[number].reset()
		else
			peopleMap[number] = new Person(number)

		peopleMap[number].started = true

		return sendText(number, "Ok, text your start location now")
	}

	var person = peopleMap[number]

	if(!person || !person.started){
		return initiate(number)
	}

	else if(person.start === null){
		person.start = body;
		return sendText(number, "Ok, text your destination now")
	}

	else if(person.end === null){
		person.end = body;

		return getDirections(person.start, person.end, function(body){
			console.log(body);
			peopleMap[number].steps = body.routes[0].legs
			sendText(number, "Now, text '" + progressionPhrase + "' to get the next set of directions!")
		})
	}

	else if(body.toLowerCase().indexOf(progressionPhrase) == 0)
		return nextDirections(number)

	else
		return sendText(number, "Text 'next' to get the next set of directions")
}

app.post("/twilio_webhook", function(req, res){
	var f = req.body.From
	var b = req.body.Body

	console.log(f, b);

	handleText(f, b);

	res.status(200);
	res.end("A+");

})

function sendText(number, body){
	console.log("Text sent to " + number + " - " + body)


	client.sendMessage({

		to: number,
		from: fromNumber,
		body: body

	}, function(err, responseData) {
		if(err)
			console.log(err)
	});

}

function nextDirections(number){
	var person = peopleMap[number];

	if(!person.getSteps()){
		return initiate(number)
	}

	if(person.directionIndex >= person.getSteps().length){
		person.reset()
		return sendText(number, "You should have arrived at your destination!")
	}

	sendText(number, person.currentStep())
	person.directionIndex++;
}




var server = app.listen(expressPort, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Listening at' + host + ':' + port);
});

// getDirections("Michigan State University", "University of Michigan", function(body){
// 	console.log(body.routes[0].legs)
// })


//