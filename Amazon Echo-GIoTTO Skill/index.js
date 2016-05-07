/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, ask Minecraft Helper how to make paper."
 *  Alexa: "(reads back recipe for paper)"
 */

'use strict';
var request = require('request');

var AlexaSkill = require('./AlexaSkill');
var access_token;
var APP_ID = undefined; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';
var SERVER_URL = "cmu.buildingdepot.org";
var PORT = "82";
var OAUTH_CLIENT_ID = "4XoVY9mHCagTtFC0ZOnngU4TmAyd1G5dgWKS7qcI";
var OAUTH_CLIENT_SECRET = "sUay6Jp7xVKEmuRIQxFNuSEiRZ232sxNIFZK2sAcvHiqdRh1WU";
var http = require('http');
var https = require('https');
var ONE_HOUR = 3600000;

var path1;
var path2;
var path3;
var path4;


/**
 * MinecraftHelper is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */

var professorArrivalTimeSensor = '2d46d3f0-c082-46e0-821a-92d0ec969ca0';
var cafeQueueLengthSensor = 'b2b4eb87-acd4-4e4b-9a34-40501d79f99e';
var timeBeforeMeetingSensor = '19b224d9-4f03-4933-b7f7-be9b132445d1';
var yourArrivalTimeToCafeSensor = '0bd1975e-3b67-4830-8a51-fb9c90e42156';


var MinecraftHelper = function () {
    AlexaSkill.call(this, APP_ID);
};


// Extend AlexaSkill
MinecraftHelper.prototype = Object.create(AlexaSkill.prototype);
MinecraftHelper.prototype.constructor = MinecraftHelper;

MinecraftHelper.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {

    getWelcomeResponse(response);
};

//TODO: add intents in alexa web page. 
MinecraftHelper.prototype.intentHandlers = {
    TimeForCoffeeIntent: function (intent, session, response) {
		var access_token_path = "/oauth/access_token/client_id="+OAUTH_CLIENT_ID+"/client_secret="+OAUTH_CLIENT_SECRET;
		var options = {
	
		  hostname: 'cmu.buildingdepot.org',
		  port: 82,
		  path: access_token_path,
		  method: 'GET',
		  rejectUnauthorized: false,
		};
		var req = https.request(options, function(res) {
			var body = '';

		    res.on('data', function(chunk){
		        body += chunk;
		    });

		    res.on('end', function(){
		        var jsonRes = JSON.parse(body);
				access_token = jsonRes.access_token;
				console.error(access_token);
				timeForCoffeeRequest(intent, session, response);
			});
		}).on('error', function(e){
		      console.log("Got an error: ", e);
		});
	
		req.end();
        
    },

    DetailsIntent: function (intent, session, response) {
        detailsRequest(intent, session, response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask questions about giotto such as, do I have time for a cup of coffee?";
        var repromptText = "You can say things like, do I have time for a cup of coffee? Now, what can I help you with?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    }
};

function timeForCoffeeRequest(intent, session, response) {
 
    var repromptText = "Sorry, I did not understand you. Could you please say again?";
    var content = "";
    var sessionAttributes = {};
//    var prefixContent = "Looks like you have "; 
//    var suffixContent = " minutes before the next meeting";

    var prefixContent  = "";
    var suffixContent  = "";
    var cardTitle = "Time for Coffee?";
    var cardText = "";
    var speechText = "";
    
    getTimeFromBD(session, function (suggestion) {
        if (suggestion == undefined) {
            speechText = "There is a problem connecting to Building Depot at this time. Please try again later.";
            response.tell(speechText);
        } 
        else {
            sessionAttributes = session.attributes;
            speechText = prefixContent + suggestion + suffixContent;
            cardText = suggestion + '\n\nTime for Professors Arrival : ' + sessionAttributes.professorArrivalTime + ' minutes. \nLength of Cafe Queue : ' + sessionAttributes.cafeQueueLength + ' customers. \nTime before next meeting : ' + sessionAttributes.timeBeforeMeeting + ' minutes. \nYour estimated arrival time to Cafe : ' + sessionAttributes.yourArrivalTimeToCafe + ' minutes.';
            response.askWithCard(speechText, repromptText, cardTitle, cardText);
        }
    });
}

function getWelcomeResponse(response) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    //Title of the card sent to the user for initiating the conversation
    var cardTitle = "Giotto Service";
    // This is the welcome message for the user.
    var speechOutput = "Hi! I am Giotto. How can I help you?";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "You can ask me what sensors are available in this room or what is the value of a particular sensor, like, What Sensors are in this room? or What is the Temperature in this room?";

    // This executes the response that will be sent to the Echo Device and also the card to the Amazon Alexa Mobile Application
    response.askWithCard(speechOutput, repromptText, cardTitle, speechOutput);
}


function parseSensorReadingFromBDUsingUUID(responseFromBD) {
    var temporaryArray;
    var responseFromBDObject = JSON.parse(responseFromBD);
    temporaryArray = responseFromBDObject.data.series[0].values[responseFromBDObject.data.series[0].values.length-1];
    return temporaryArray[2];
}


function getTimeFromBD(session, eventCallback){
 
    var response1;
    var response2;
    var response3;
    var response4;
    
    var sensorReadUrlPrefix = 'https://' + SERVER_URL + ":" + PORT + "/api/sensor/";
    var now = new Date().getTime();
    var startTime = now- ONE_HOUR;
    var endTime = now;
    var sensorReadUrlSuffix = "/timeseries?start_time="+ startTime +"&end_time="+ endTime;

	path1 = sensorReadUrlPrefix+ professorArrivalTimeSensor + sensorReadUrlSuffix;
	path2 = sensorReadUrlPrefix+ cafeQueueLengthSensor + sensorReadUrlSuffix;
	path3 = sensorReadUrlPrefix+ timeBeforeMeetingSensor + sensorReadUrlSuffix;
	path4 = sensorReadUrlPrefix+ yourArrivalTimeToCafeSensor + sensorReadUrlSuffix;

    var sessionAttributes = {};
    var professorArrivalTimeSensorValue;
    var cafeQueueLengthSensorValue;
    var timeBeforeMeetingSensorValue;
    var yourArrivalTimeToCafeSensorValue;
    var estimatedWaitTimePerCustomer = 2; //Hardcoded for now. May be changed in the future
	
	request({
      headers: {
		 'content-type': 'application/json'
	  },
	  method: 'GET',
	  url: path1,
	  auth: {
	    'bearer': access_token
	  }
	}, function(err, response, body1) {
        professorArrivalTimeSensorValue = parseSensorReadingFromBDUsingUUID(body1);
		
        professorArrivalTimeSensorValue = professorArrivalTimeSensorValue.substring(0,professorArrivalTimeSensorValue.indexOf(' '));
		request({
	      headers: {
			 'content-type': 'application/json'
		  },
		  method: 'GET',
		  url: path2,
		  auth: {
		    'bearer': access_token
		  }
		}, function(err, response, body2) {
            cafeQueueLengthSensorValue = parseSensorReadingFromBDUsingUUID(body2);
			request({
		      headers: {
				 'content-type': 'application/json'
			  },
			  method: 'GET',
			  url: path3,
			  auth: {
			    'bearer': access_token
			  }
			}, function(err, response, body3) {
	            timeBeforeMeetingSensorValue = parseSensorReadingFromBDUsingUUID(body3);
				var currentTime = (new Date).getTime();
                if(timeBeforeMeetingSensorValue > currentTime)
                {
                    var timeDifference = timeBeforeMeetingSensorValue - currentTime;
                }
                else
                {
                    var timeDifference = 0;
                }
                var minutes = timeDifference / 60000;
                var minuteString = parseInt(minutes,10);
                timeBeforeMeetingSensorValue = minuteString;
				request({
			      headers: {
					 'content-type': 'application/json'
				  },
				  method: 'GET',
				  url: path4,
				  auth: {
				    'bearer': access_token
				  }
				}, function(err, response, body4) {
		            yourArrivalTimeToCafeSensorValue = parseSensorReadingFromBDUsingUUID(body4);
					yourArrivalTimeToCafeSensorValue = yourArrivalTimeToCafeSensorValue.substring(0,yourArrivalTimeToCafeSensorValue.indexOf(' '));
                    
					//Logic for making decision
                    if (professorArrivalTimeSensorValue > timeBeforeMeetingSensorValue)
                        timeBeforeMeetingSensorValue = professorArrivalTimeSensorValue;
                    if (((yourArrivalTimeToCafeSensorValue*2)+(cafeQueueLengthSensorValue*estimatedWaitTimePerCustomer)) > timeBeforeMeetingSensorValue)
                        var suggestion = "I'm Afraid you do not have enough time to get a Coffee";
                    else
                        var suggestion = "Yay! You have time for a delicious cup of Coffee!";

                    sessionAttributes.professorArrivalTime = professorArrivalTimeSensorValue;
                    sessionAttributes.cafeQueueLength = cafeQueueLengthSensorValue;
                    sessionAttributes.timeBeforeMeeting = minuteString;
                    sessionAttributes.yourArrivalTimeToCafe = yourArrivalTimeToCafeSensorValue;
                    sessionAttributes.lastIntent = "TimeForCoffeeIntent";
                    session.attributes=sessionAttributes;

                    eventCallback(suggestion);
		
			   });
		
		   });
	   });
	});
	
	
}				

    


function detailsRequest(intent, session, response) {
    var repromptText = "Sorry, I did not understand what you said. Could you please say again?";
    var sessionAttributes = session.attributes;
    var string1 = "";
    var string2 = "";
    var string3 = "";
    var string4 = "";
    
    if(sessionAttributes.lastIntent !==undefined){
        if(sessionAttributes.lastIntent == "TimeForCoffeeIntent")
        {
            if(sessionAttributes.professorArrivalTime > 1)
            {
                string1 = 'Time for Professors arrival : ' + sessionAttributes.professorArrivalTime + ' minutes, ';
            }
            else if(sessionAttributes.professorArrivalTime == 1)
            {
                string1 = 'Time for Professors arrival : ' + sessionAttributes.professorArrivalTime + ' minute, ';   
            }
            else
            {
                string1 = 'The Professor has already arrrived, ';
            }
            if(sessionAttributes.cafeQueueLength > 1)
            {
                string2 = 'Length of Cafe Queue : ' + sessionAttributes.cafeQueueLength + ' customers, ';
            }
            else if(sessionAttributes.cafeQueueLength == 1)
            {
                string2 = 'Length of Cafe Queue : ' + sessionAttributes.cafeQueueLength + ' customer, ';   
            }
            else
            {
                string2 = 'There is no queue at the Cafe, ';
            }
            if(sessionAttributes.timeBeforeMeeting > 1)
            {
                string3 = 'Time before next meeting : ' + sessionAttributes.timeBeforeMeeting + ' minutes, ';
            }
            else if(sessionAttributes.timeBeforeMeeting == 1)
            {
                string3 = 'Time before next meeting : ' + sessionAttributes.timeBeforeMeeting + ' minute, ';   
            }
            else
            {
                string3 = 'The meeting has already started, ';
            }
            if(sessionAttributes.professorArrivalTime == 1)
            {
                string4 = 'Your estimated arrival time to Cafe : ' + sessionAttributes.yourArrivalTimeToCafe + ' minute. ';
            }
            else
            {
                string4 = 'Your estimated arrival time to Cafe : ' + sessionAttributes.yourArrivalTimeToCafe + ' minutes.';   
            }

            response.ask(string1 + string2 + string3 + string4, repromptText);
        }
        else
        {
            response.ask('Sorry, I do not have any details to provide.', repromptText);
        }   
    }
    else{
        response.ask('Sorry, I do not have any details to provide.', repromptText);
    }
}

exports.handler = function (event, context) {
    var minecraftHelper = new MinecraftHelper();
    minecraftHelper.execute(event, context);
};
