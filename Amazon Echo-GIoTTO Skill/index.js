// Alexa SDK for JavaScript v1.0.00
// Copyright (c) 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved. Use is subject to license terms.

/**
 * App ID for the skill
 */
var APP_ID = undefined; // amzn1.echo-sdk-ams.app.4faf5bda-e6c0-4c1e-ae68-919eec02e42c;//replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

/**
 * http is required to make conections to Building Depot. We may also use https in a similar way after Building Depot has proper security certificates
 */
var http = require('http');
var https = require('https');
var access_token;
var SERVER_URL = "bd-test.andrew.cmu.edu";
var PORT = "82";
var OAUTH_CLIENT_ID = "b7B9dmCP6ClCWAi6efdppL890gkd8PoDcMlx0jC0";
var OAUTH_CLIENT_SECRET = "X0kFwvpqujOaFzeAQxcskxDm6b9OaoBb29WlVJq09e8wTTgHfg";
var ONE_HOUR = 3600000;
/**
 * The AlexaSkill Module that has the AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * URL prefix to connect to Kettle
 */
var kettleUrlPrefix = 'http://kettle.ubiq.cs.cmu.edu:8080/greeting';

/**
 * URL prefix to connect to BuildingDepot
 */
var bdUrlPrefix = 'http://buildingdepot.andrew.cmu.edu:82/service/api/v1';
var sensorReadUrlPrefix = 'http://buildingdepot.andrew.cmu.edu:82/service/api/v1/data/id=';

/**
 * URL suffix to connect to BuildingDepot
 */
var bdUrlSuffix = '/tags';


/**
 * UUID for Coffee Scenario Sensors
 */
var professorArrivalTimeSensor = '2d46d3f0-c082-46e0-821a-92d0ec969ca0';
var cafeQueueLengthSensor = 'b2b4eb87-acd4-4e4b-9a34-40501d79f99e';
var timeBeforeMeetingSensor = '19b224d9-4f03-4933-b7f7-be9b132445d1';
var yourArrivalTimeToCafeSensor = '0bd1975e-3b67-4830-8a51-fb9c90e42156';

/**
 * CrisisBuffSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var CrisisBuffSkill = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
CrisisBuffSkill.prototype = Object.create(AlexaSkill.prototype);
CrisisBuffSkill.prototype.constructor = CrisisBuffSkill;

CrisisBuffSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("CrisisBuffSkill onSessionStarted requestId: " + sessionStartedRequest.requestId +
    ", sessionId: " + session.sessionId);

    // any session init logic would go here
};

//This is the onLaunch Handler. This is executed when the user initiates the conversation. We log the requestId and sessionId.
CrisisBuffSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("CrisisBuffSkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    getWelcomeResponse(response);
    getAuth();
};

CrisisBuffSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId +
    ", sessionId: " + session.sessionId);

    // any session cleanup logic would go here
};

CrisisBuffSkill.prototype.intentHandlers = {

    KettleGreetingIntent: function (intent, session, response) {
        kettleGreetingRequest(intent, session, response);
    },

    BDGreetingIntent: function (intent, session, response) {
        bdGreetingRequest(intent, session, response);
    },

    BDSensorReadIntent: function (intent, session, response) {
        bdSensorReadRequest(intent, session, response);
    },

    BDSensorListIntent: function (intent, session, response) {
        bdSensorListRequest(intent, session, response);
    },

    TimeForCoffeeIntent: function (intent, session, response) {
        timeForCoffeeRequest(intent, session, response);
    },

    DetailsIntent: function (intent, session, response) {
        detailsRequest(intent, session, response);
    },

    HelpIntent: function (intent, session, response) {
        var speechOutput = "You can ask me what sensors are available in this room or what is the value of a particular sensor, like, What Sensors are in this room? or What is the Temperature in this room?";
        response.ask(speechOutput);
    },

    FinishIntent: function (intent, session, response) {
        var speechOutput = "Thank You! Bye!";
        response.tell(speechOutput);
    }
};

function getAuth(){
    var url = 'http://' + SERVER_URL + ":" + PORT + "/oauth/access_token/client_id=" + OAUTH_CLIENT_ID + '/client_secret=' + OAUTH_CLIENT_SECRET;
    $.ajax({
                url: url,
                type: 'GET',
                dataType: 'json',
                success: function(res) {
                    access_token = res.access_token;
                     
                },
                error: function() {
                       alert("Fail to Get OAuth!");
                }
     });
   
}

/**
 * Function to handle the onLaunch skill behavior
 */

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

function kettleGreetingRequest(intent, session, response) {
    var varSlot = intent.slots.Variable;
    var repromptText = "Sorry, I did not understand what you said. Could you please say again?";
    var sessionAttributes = {};
    var name = ""; 
    if (varSlot && varSlot.value) {
        name = new String(varSlot.value);
    } else {
        name = new String();
    }

    prefixContent = "Hello, ";
    var cardTitle = "Greeting for " + name;
    var speechText = "";
    sessionAttributes.text = name;
    session.attributes = sessionAttributes;

    getSensorReadingFromBDUsingUUID(name, function (greeting) {
        if (greeting == undefined) {
            speechText = "There is a problem connecting to Buidling Depot Sensors at this time. Please try again later.";
            response.tell(speechText);
        } else {
                speechText = speechText + greeting + " ";
        }
        response.askWithCard(prefixContent + speechText, repromptText, cardTitle, speechText);
    });
}

function getJsonGreetingFromKettle(name, eventCallback) {
    var url = kettleUrlPrefix;

    http.get(url, function(res) {
        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            var stringResult = parseKettleRequest(body);
            eventCallback(stringResult);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
}

function parseKettleRequest(responseFromKettle) {
   var text = responseFromKettle.substring(text.indexOf("content")+10, text.indexOf("!\"}"));
    if (text.length === 0) {
        return 'Error in parsing';
    }
    else{
            return text;
    }
}

function bdGreetingRequest(intent, session, response) {
    var varSlot = intent.slots.Variable;
    var repromptText = "Sorry, I did not understand you. Could you please say again?";
    var sessionAttributes = {};
    var name = ""; 
    var cardTitle;
    if (varSlot && varSlot.value) {
        name = new String(varSlot.value);
        prefixContent = "Hi " + name + " How may I help you?";
        cardTitle = "Greeting for " + name;
    } else {
        name = new String();
        prefixContent = "I'm Sorry, I did not catch your name. What was is your name?";
        cardTitle = "Greetings!";
    }

    sessionAttributes.text = name;
    session.attributes = sessionAttributes;
    
    //getJsonGreetingFromBD(name, function (greeting) {
    //    if (greeting.length === 0) {
    //        speechText = "There is a problem connecting to Building Depot at this time. Please try again later.";
    //        response.tell(speechText);
    //    } 
    //    else {
    //    speechText = speechText + greeting;
    //    sessionAttributes.greetings = greeting;
    //    session.attributes = sessionAttributes;
        response.askWithCard(prefixContent, repromptText, cardTitle, speechText);
    //    }
    //});
}

function getJsonGreetingFromBD(name, eventCallback) {
    var url = bdUrlPrefix + "/Room=Test" + bdUrlSuffix ;
    var body = "";

    http.get(url, function(res) {
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            eventCallback(parseBDRequest(body));
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        eventCallback(res.statusCode);
    });
}

function parseBDRequest(responseFromBD) {
    var text = '';
    var responseFromBDObject = JSON.parse(responseFromBD);
    text = responseFromBDObject.data.sensor_1.metadata.Type;
    return text;
}

function bdSensorReadRequest(intent, session, response) {
    var typeSlot = intent.slots.Type;
    var roomSlot = intent.slots.Room;
    var type;
    var room;
    var roomValue;
    var sensorValue = "";

    if (typeSlot && typeSlot.value) {
        type = new String(typeSlot.value);
    } else {
        type = new String();
    }
    if (roomSlot && roomSlot.value) {
        roomValue = new String(roomSlot.value);
    } else {
        roomValue = new String();
    }

    if(roomValue == "here" || roomValue == "this" || roomValue == "here" || roomValue == "this room" || roomValue == "anind's office" || roomValue == "aninds office" || roomValue == "three five one nine" || roomValue == "room three five one nine" ) {
        room = "3519";
    }
    if(roomValue == "three five zero one") {
        room = "3501";
    }
    if(type == "temperature" || type == "temperature value") {
        type = "Temperature";
    }
    else if(type == "humidity" || type == "humidity value") {
        type = "Humidity";
    }   
    else if(type == "accelerometer" || type == "accelerometer value") {
        type = "Accelerometer";
    }
    else if(type == "light" || type == "light intensity" || type == "light value") {
        type = "Lux";
    }
    else if(type == "air pressure" || type == "pressure" || type == "pressure value") {
        type = "Pressure";
    }

    var repromptText = "Sorry, I did not understand you. Could you please say again?";
    var sessionAttributes = {};
    var content = "";

    prefixContent = "The " + type + " value in " + roomValue + " is ";
    var cardTitle = "Sensor Value";
    var speechText = "";
    sessionAttributes.room = room;
    sessionAttributes.typeOfSensor = type;
    sessionAttributes.lastIntent = "BDSensorReadIntent";
    session.attributes = sessionAttributes;
    
    getSensorReadingFromBD(session, function (sensorValue1) {
        if (sensorValue1 == undefined) {
            speechText = "There is a problem connecting to Building Depot at this time. Please try again later.";
            response.tell(speechText);
        } 
        response.tellWithCard("I cannot find any sensors right now. Sorry.", "No Sensors", "I cannot find any sensors right now. Sorry.");
        /*
        else {
        getSensorReadingFromBDUsingUUID(sensorValue1, function(sensorValueFromBDUsingUUID){
            sensorValue = sensorValueFromBDUsingUUID;
            speechText = speechText + sensorValue;
            sessionAttributes.sensorValue = sensorValue;
            session.attributes = sessionAttributes;
            prefixContent += speechText;
            response.askWithCard(prefixContent, repromptText, cardTitle, prefixContent);
        });
        }
        */
    });
}

function getSensorReadingFromBD(session, eventCallback) {
    var url = "";
    var roomPath = "";
    var response = "";

    if(session.attributes.room !== undefined)
    {
        roomPath = "/Room=" + session.attributes.room;
    }

    url = bdUrlPrefix + roomPath + bdUrlSuffix;

///////////////////////
    eventCallback(url);
///////////////////////


    http.get(url, function(res) {
        res.on('data', function(chunk) {
            response += chunk;
        });
        res.on('end', function() {
            eventCallback(parseSensorReadingFromBD(session,response));
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        eventCallback(res.statusCode);
    });

}

function parseSensorReadingFromBD(session,responseFromBD) {
    
    var sensorValue = "";
    var responseFromBDObject = JSON.parse(responseFromBD);
    var sensorArray = {
        sensors: []
    };
    var temporarySensor;
    var iterator = 1;
    var flag = 0;
    var UUID = [];
    var UUIDIterator = 0;
    
    if (responseFromBDObject.data.sensor_1 != undefined) {
        sensorArray.sensors[0] = responseFromBDObject.data.sensor_1;
    }
    if (responseFromBDObject.data.sensor_2 != undefined) {
        sensorArray.sensors[1] = responseFromBDObject.data.sensor_2;
    }
    if (responseFromBDObject.data.sensor_3 != undefined) {
        sensorArray.sensors[2] = responseFromBDObject.data.sensor_3;
    }
    if (responseFromBDObject.data.sensor_4 != undefined) {
        sensorArray.sensors[3] = responseFromBDObject.data.sensor_4;
    }
    if (responseFromBDObject.data.sensor_5 != undefined) {
        sensorArray.sensors[4] = responseFromBDObject.data.sensor_5;
    }
    if (responseFromBDObject.data.sensor_6 != undefined) {
        sensorArray.sensors[5] = responseFromBDObject.data.sensor_6;
    }
    if (responseFromBDObject.data.sensor_7 != undefined) {
        sensorArray.sensors[6] = responseFromBDObject.data.sensor_7;
    }
    if (responseFromBDObject.data.sensor_8 != undefined) {
        sensorArray.sensors[7] = responseFromBDObject.data.sensor_8;
    }
    if (responseFromBDObject.data.sensor_9 != undefined) {
        sensorArray.sensors[8] = responseFromBDObject.data.sensor_9;
    }
    if (responseFromBDObject.data.sensor_10 != undefined) {
        sensorArray.sensors[9] = responseFromBDObject.data.sensor_10;
    }
    if (responseFromBDObject.data.sensor_11 != undefined) {
        sensorArray.sensors[10] = responseFromBDObject.data.sensor_11;
    }
    if (responseFromBDObject.data.sensor_12 != undefined) {
        sensorArray.sensors[11] = responseFromBDObject.data.sensor_12;
    }
    if (responseFromBDObject.data.sensor_13 != undefined) {
        sensorArray.sensors[12] = responseFromBDObject.data.sensor_13;
    }
    if (responseFromBDObject.data.sensor_14 != undefined) {
        sensorArray.sensors[13] = responseFromBDObject.data.sensor_14;
    }
    if (responseFromBDObject.data.sensor_15 != undefined) {
        sensorArray.sensors[14] = responseFromBDObject.data.sensor_15;
    }
    if (responseFromBDObject.data.sensor_16 != undefined) {
        sensorArray.sensors[15] = responseFromBDObject.data.sensor_16;
    }
    if (responseFromBDObject.data.sensor_17 != undefined) {
        sensorArray.sensors[16] = responseFromBDObject.data.sensor_17;
    }
    if (responseFromBDObject.data.sensor_18 != undefined) {
        sensorArray.sensors[17] = responseFromBDObject.data.sensor_18;
    }
    if (responseFromBDObject.data.sensor_19 != undefined) {
        sensorArray.sensors[18] = responseFromBDObject.data.sensor_19;
    }
    if (responseFromBDObject.data.sensor_20 != undefined) {
        sensorArray.sensors[19] = responseFromBDObject.data.sensor_20;
    }
    if (responseFromBDObject.data.sensor_21 != undefined) {
        sensorArray.sensors[20] = responseFromBDObject.data.sensor_21;
    }
    if (responseFromBDObject.data.sensor_22 != undefined) {
        sensorArray.sensors[21] = responseFromBDObject.data.sensor_22;
    }
    if (responseFromBDObject.data.sensor_23 != undefined) {
        sensorArray.sensors[22] = responseFromBDObject.data.sensor_23;
    }
    if (responseFromBDObject.data.sensor_24 != undefined) {
        sensorArray.sensors[23] = responseFromBDObject.data.sensor_24;
    }
    if (responseFromBDObject.data.sensor_25 != undefined) {
        sensorArray.sensors[24] = responseFromBDObject.data.sensor_25;
    }
    if (responseFromBDObject.data.sensor_26 != undefined) {
        sensorArray.sensors[25] = responseFromBDObject.data.sensor_26;
    }
    if (responseFromBDObject.data.sensor_27 != undefined) {
        sensorArray.sensors[26] = responseFromBDObject.data.sensor_27;
    }
    if (responseFromBDObject.data.sensor_28 != undefined) {
        sensorArray.sensors[27] = responseFromBDObject.data.sensor_28;
    }
    if (responseFromBDObject.data.sensor_29 != undefined) {
        sensorArray.sensors[28] = responseFromBDObject.data.sensor_29;
    }
    if (responseFromBDObject.data.sensor_30 != undefined) {
        sensorArray.sensors[29] = responseFromBDObject.data.sensor_30;
    }
    if (responseFromBDObject.data.sensor_31 != undefined) {
        sensorArray.sensors[30] = responseFromBDObject.data.sensor_31;
    }
    if (responseFromBDObject.data.sensor_32 != undefined) {
        sensorArray.sensors[31] = responseFromBDObject.data.sensor_32;
    }
    if (responseFromBDObject.data.sensor_33 != undefined) {
        sensorArray.sensors[32] = responseFromBDObject.data.sensor_33;
    }
    if (responseFromBDObject.data.sensor_34 != undefined) {
        sensorArray.sensors[33] = responseFromBDObject.data.sensor_34;
    }
    if (responseFromBDObject.data.sensor_35 != undefined) {
        sensorArray.sensors[34] = responseFromBDObject.data.sensor_35;
    }
    if (responseFromBDObject.data.sensor_36 != undefined) {
        sensorArray.sensors[35] = responseFromBDObject.data.sensor_36;
    }
    if (responseFromBDObject.data.sensor_37 != undefined) {
        sensorArray.sensors[36] = responseFromBDObject.data.sensor_37;
    }
    if (responseFromBDObject.data.sensor_38 != undefined) {
        sensorArray.sensors[37] = responseFromBDObject.data.sensor_38;
    }
    if (responseFromBDObject.data.sensor_39 != undefined) {
        sensorArray.sensors[38] = responseFromBDObject.data.sensor_39;
    }
    if (responseFromBDObject.data.sensor_40 != undefined) {
        sensorArray.sensors[39] = responseFromBDObject.data.sensor_40;
    }
    if (responseFromBDObject.data.sensor_41 != undefined) {
        sensorArray.sensors[40] = responseFromBDObject.data.sensor_41;
    }
    if (responseFromBDObject.data.sensor_42 != undefined) {
        sensorArray.sensors[41] = responseFromBDObject.data.sensor_42;
    }
    if (responseFromBDObject.data.sensor_43 != undefined) {
        sensorArray.sensors[42] = responseFromBDObject.data.sensor_43;
    }
    if (responseFromBDObject.data.sensor_44 != undefined) {
        sensorArray.sensors[43] = responseFromBDObject.data.sensor_44;
    }
    if (responseFromBDObject.data.sensor_45 != undefined) {
        sensorArray.sensors[44] = responseFromBDObject.data.sensor_45;
    }
    if (responseFromBDObject.data.sensor_46 != undefined) {
        sensorArray.sensors[45] = responseFromBDObject.data.sensor_46;
    }
    if (responseFromBDObject.data.sensor_47 != undefined) {
        sensorArray.sensors[46] = responseFromBDObject.data.sensor_47;
    }
    if (responseFromBDObject.data.sensor_48 != undefined) {
        sensorArray.sensors[47] = responseFromBDObject.data.sensor_48;
    }
    if (responseFromBDObject.data.sensor_49 != undefined) {
        sensorArray.sensors[48] = responseFromBDObject.data.sensor_49;
    }
    if (responseFromBDObject.data.sensor_50 != undefined) {
        sensorArray.sensors[49] = responseFromBDObject.data.sensor_50;
    }
   
    iterator = 0;
    while(iterator < 50)
    {
        if (sensorArray.sensors[iterator].metadata.Type == session.attributes.typeOfSensor)
        {
            UUIDIterator++;
            UUID[UUIDIterator] = sensorArray.sensors[iterator].name;
        }
        iterator = iterator + 1;
    }
    UUID[0]=UUIDIterator;
    return UUID;
}

function getSensorReadingFromBDUsingUUID(UUID, eventCallback) {
    var url = "";
    var response = "";
    var iterator = 1;
    var idPath;
    var sensorValue = 0;
    var tempSensorValue = 0;

    while(UUID.length>=2)
    {
        idPath = "/api/sensor/timeseries/?" + UUID[iterator] + "/interval=100h/";

        url = bdUrlPrefix + idPath;
    
        http.get(url, function(res) {
            res.on('data', function(chunk) {
                response += chunk;
            });
            res.on('end', function() {
                tempSensorValue = parseSensorReadingFromBDUsingUUID(response);
                if(sensorValue===0)
                {
                    sensorValue = tempSensorValue;
                }
                else
                {
                    sensorValue = (sensorValue + tempSensorValue)/2;
                }
    
                if((iterator+1)==UUID.length)
                {              
                    eventCallback(sensorValue);    
                }
                else
                {
                    iterator++;
                }
            });
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
            eventCallback(res.statusCode);
        });
    }
}

function parseSensorReadingFromBDUsingUUID(responseFromBD) {
    var temporaryArray;
    var responseFromBDObject = JSON.parse(responseFromBD);
    temporaryArray = responseFromBDObject.data.series[0].values[responseFromBDObject.data.series[0].values.length-1];
    return temporaryArray[2];
}

function bdSensorListRequest(intent, session, response) {
    var roomSlot = intent.slots.Room;
    var room = "";
    var roomValue;
    var overallSensorCount = 0;
    var temperatureSensorCount = 0;
    var humiditySensorCount = 0;
    var pressureSensorCount = 0;
    var accelerometerSensorCount = 0;
    var lightSensorCount = 0;
    
    if (roomSlot && roomSlot.value) {
        roomValue = new String(roomSlot.value);
    } else {
        roomValue = new String();
    }
    
    if(roomValue == "here" || roomValue == "this" || roomValue == "this room" || roomValue == "anind's office" || roomValue == "aninds office" || roomValue == "three five one nine" || roomValue == "room three five one nine" ) {
        room = "3519";
    }
    if(roomValue == "three five zero one") {
        room = "3501";
    }
    
    var repromptText = "Sorry, I did not understand you. Could you please say again?";
    var sessionAttributes = {};
    var content = "";

    prefixContent = "The total number of sensors in " + roomValue + " are ";
    var cardTitle = "Sensors in " + roomValue + ":";
    var cardContent = "";
    var speechText = "";
    sessionAttributes.room = room;
    sessionAttributes.overall = overallSensorCount;
    sessionAttributes.temperature = temperatureSensorCount;
    sessionAttributes.humidity = humiditySensorCount;
    sessionAttributes.pressure = pressureSensorCount;
    sessionAttributes.accelerometer = accelerometerSensorCount;
    sessionAttributes.light = lightSensorCount;
    sessionAttributes.lastIntent = "BDSensorListIntent";
    session.attributes = sessionAttributes;

    getSensorListFromBD(session, function (sensorListFromBDResult) {
        if (sensorListFromBDResult == undefined) {
            speechText = "There is a problem connecting to Building Depot at this time. Please try again later.";
            response.tell(speechText);
        } 
        else {
            speechText += sensorListFromBDResult.overallSensorCount;
            sessionAttributes.overall = sensorListFromBDResult.overallSensorCount;
            sessionAttributes.temperature = sensorListFromBDResult.temperatureSensorCount;
            sessionAttributes.humidity = sensorListFromBDResult.humiditySensorCount;
            sessionAttributes.pressure = sensorListFromBDResult.pressureSensorCount;
            sessionAttributes.accelerometer = sensorListFromBDResult.accelerometerSensorCount;
            sessionAttributes.light = sensorListFromBDResult.lightSensorCount;
            session.attributes = sessionAttributes;
            prefixContent += speechText;

            speechText = ". There are " + sensorListFromBDResult.accelerometerSensorCount + " Accelerometer Sensors, " +
            sensorListFromBDResult.humiditySensorCount + " Humidity Sensors, " +
            sensorListFromBDResult.lightSensorCount + " Light Sensors, " +
            sensorListFromBDResult.pressureSensorCount + " Pressure Sensors, and " +
            sensorListFromBDResult.temperatureSensorCount + " Temperature Sensors.";
            prefixContent += speechText;

            cardContent = prefixContent + 
                "\n Accelerometer Sensors: " + sensorListFromBDResult.accelerometerSensorCount +
                "\n Humidity Sensors: " + sensorListFromBDResult.humiditySensorCount +
                "\n Light Sensors: " + sensorListFromBDResult.lightSensorCount +
                "\n Pressure Sensors: " + sensorListFromBDResult.pressureSensorCount +
                "\n Temperature Sensors: " + sensorListFromBDResult.temperatureSensorCount + "";

            response.askWithCard(prefixContent, repromptText, cardTitle, cardContent);
        }
    });
}

function getSensorListFromBD(session, eventCallback) {
    var url = "";
    var roomPath = "";
    var response = "";

    if(session.attributes.room !== undefined)
    {
        roomPath = "/Room=" + session.attributes.room;
    }

    url = bdUrlPrefix + roomPath + bdUrlSuffix;
    
    http.get(url, function(res) {
        res.on('data', function(chunk) {
            response += chunk;
        });
        res.on('end', function() {
            eventCallback(parseSensorListFromBD(session,response));
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        eventCallback(res.statusCode);
    });
}

function parseSensorListFromBD(session,responseFromBD) {
    
    var responseFromBDObject = JSON.parse(responseFromBD);
    var sensorArray = {
        sensors: []
    };
    var response = {
        overallSensorCount: 0,
        accelerometerSensorCount: 0,
        humiditySensorCount: 0,
        lightSensorCount: 0,
        pressureSensorCount: 0,
        temperatureSensorCount: 0
    };
    
    var temporarySensor;
    var iterator = 1;
    var flag = 0;
    
    if (responseFromBDObject.data.sensor_1 != undefined) {
        sensorArray.sensors[0] = responseFromBDObject.data.sensor_1;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_2 != undefined) {
        sensorArray.sensors[1] = responseFromBDObject.data.sensor_2;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_3 != undefined) {
        sensorArray.sensors[2] = responseFromBDObject.data.sensor_3;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_4 != undefined) {
        sensorArray.sensors[3] = responseFromBDObject.data.sensor_4;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_5 != undefined) {
        sensorArray.sensors[4] = responseFromBDObject.data.sensor_5;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_6 != undefined) {
        sensorArray.sensors[5] = responseFromBDObject.data.sensor_6;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_7 != undefined) {
        sensorArray.sensors[6] = responseFromBDObject.data.sensor_7;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_8 != undefined) {
        sensorArray.sensors[7] = responseFromBDObject.data.sensor_8;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_9 != undefined) {
        sensorArray.sensors[8] = responseFromBDObject.data.sensor_9;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_10 != undefined) {
        sensorArray.sensors[9] = responseFromBDObject.data.sensor_10;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_11 != undefined) {
        sensorArray.sensors[10] = responseFromBDObject.data.sensor_11;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_12 != undefined) {
        sensorArray.sensors[11] = responseFromBDObject.data.sensor_12;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_13 != undefined) {
        sensorArray.sensors[12] = responseFromBDObject.data.sensor_13;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_14 != undefined) {
        sensorArray.sensors[13] = responseFromBDObject.data.sensor_14;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_15 != undefined) {
        sensorArray.sensors[14] = responseFromBDObject.data.sensor_15;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_16 != undefined) {
        sensorArray.sensors[15] = responseFromBDObject.data.sensor_16;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_17 != undefined) {
        sensorArray.sensors[16] = responseFromBDObject.data.sensor_17;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_18 != undefined) {
        sensorArray.sensors[17] = responseFromBDObject.data.sensor_18;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_19 != undefined) {
        sensorArray.sensors[18] = responseFromBDObject.data.sensor_19;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_20 != undefined) {
        sensorArray.sensors[19] = responseFromBDObject.data.sensor_20;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_21 != undefined) {
        sensorArray.sensors[20] = responseFromBDObject.data.sensor_21;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_22 != undefined) {
        sensorArray.sensors[21] = responseFromBDObject.data.sensor_22;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_23 != undefined) {
        sensorArray.sensors[22] = responseFromBDObject.data.sensor_23;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_24 != undefined) {
        sensorArray.sensors[23] = responseFromBDObject.data.sensor_24;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_25 != undefined) {
        sensorArray.sensors[24] = responseFromBDObject.data.sensor_25;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_26 != undefined) {
        sensorArray.sensors[25] = responseFromBDObject.data.sensor_26;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_27 != undefined) {
        sensorArray.sensors[26] = responseFromBDObject.data.sensor_27;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_28 != undefined) {
        sensorArray.sensors[27] = responseFromBDObject.data.sensor_28;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_29 != undefined) {
        sensorArray.sensors[28] = responseFromBDObject.data.sensor_29;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_30 != undefined) {
        sensorArray.sensors[29] = responseFromBDObject.data.sensor_30;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_31 != undefined) {
        sensorArray.sensors[30] = responseFromBDObject.data.sensor_31;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_32 != undefined) {
        sensorArray.sensors[31] = responseFromBDObject.data.sensor_32;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_33 != undefined) {
        sensorArray.sensors[32] = responseFromBDObject.data.sensor_33;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_34 != undefined) {
        sensorArray.sensors[33] = responseFromBDObject.data.sensor_34;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_35 != undefined) {
        sensorArray.sensors[34] = responseFromBDObject.data.sensor_35;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_36 != undefined) {
        sensorArray.sensors[35] = responseFromBDObject.data.sensor_36;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_37 != undefined) {
        sensorArray.sensors[36] = responseFromBDObject.data.sensor_37;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_38 != undefined) {
        sensorArray.sensors[37] = responseFromBDObject.data.sensor_38;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_39 != undefined) {
        sensorArray.sensors[38] = responseFromBDObject.data.sensor_39;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_40 != undefined) {
        sensorArray.sensors[39] = responseFromBDObject.data.sensor_40;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_41 != undefined) {
        sensorArray.sensors[40] = responseFromBDObject.data.sensor_41;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_42 != undefined) {
        sensorArray.sensors[41] = responseFromBDObject.data.sensor_42;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_43 != undefined) {
        sensorArray.sensors[42] = responseFromBDObject.data.sensor_43;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_44 != undefined) {
        sensorArray.sensors[43] = responseFromBDObject.data.sensor_44;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_45 != undefined) {
        sensorArray.sensors[44] = responseFromBDObject.data.sensor_45;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_46 != undefined) {
        sensorArray.sensors[45] = responseFromBDObject.data.sensor_46;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_47 != undefined) {
        sensorArray.sensors[46] = responseFromBDObject.data.sensor_47;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_48 != undefined) {
        sensorArray.sensors[47] = responseFromBDObject.data.sensor_48;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_49 != undefined) {
        sensorArray.sensors[48] = responseFromBDObject.data.sensor_49;
        response.overallSensorCount++;
    }
    if (responseFromBDObject.data.sensor_50 != undefined) {
        sensorArray.sensors[49] = responseFromBDObject.data.sensor_50;
        response.overallSensorCount++;
    }
   
    for (iterator = 0; iterator < response.overallSensorCount; iterator++) {
        switch(sensorArray.sensors[iterator].metadata.Type){
            case "Accelerometer": response.accelerometerSensorCount++;
                break;
            case "Humidity": response.humiditySensorCount++;
                break;
            case "Lux": response.lightSensorCount++;
                break;
            case "Pressure": response.pressureSensorCount++;
                break;
            case "Temperature": response.temperatureSensorCount++;
                break;
            default: break;
        }
    }

    return response;
}

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

function getTimeFromBD(session, eventCallback){
 
    var response1;
    var response2;
    var response3;
    var response4;
    
    var sensorReadUrlPrefix = 'https://' + SERVER_URL + ":" + PORT + "/api/sensor/timeseries/?"
    var now = new Date().getTime();
    var startTime = now- ONE_HOUR;
    var endTime = now;
    var sensorReadUrlSuffix = "start_time="+ startTime +"&end_time="+ endTime;

    path1 = "/api/sensor/"+ professorArrivalTimeSensor +"/timeseries/?"+sensorReadUrlSuffix;
    path2 = "/api/sensor/"+ cafeQueueLengthSensor +"/timeseries/?"+sensorReadUrlSuffix;
    path3 = "/api/sensor/"+ timeBeforeMeetingSensor +"/timeseries/?"+sensorReadUrlSuffix;
    path4 = "/api/sensor/"+ yourArrivalTimeToCafeSensor + "/timeseries/?"+sensorReadUrlSuffix;

    var options1 = {
    hostname: SERVER_URL,
    path: path1,
    headers: {
        Authorization: 'Bearer ' + access_token
    }
    };
    var options2 = {
    hostname: SERVER_URL,
    path: path2,
    headers: {
        Authorization: 'Bearer ' + access_token
    }
    };
    var options3 = {
    hostname: SERVER_URL,
    path: path3,
    headers: {
        Authorization: 'Bearer ' + access_token
    }
    };
    var options4 = {
    hostname: SERVER_URL,
    path: path4,
    headers: {
        Authorization: 'Bearer ' + access_token
    }
    };


    var sessionAttributes = {};
    var professorArrivalTimeSensorValue;
    var cafeQueueLengthSensorValue;
    var timeBeforeMeetingSensorValue;
    var yourArrivalTimeToCafeSensorValue;
    var estimatedWaitTimePerCustomer = 2; //Hardcoded for now. May be changed in the future

    https.get(options1, function(res1) {
        res1.on('data', function(chunk1) {
            response1 += chunk1;
        });
        res1.on('end', function() {
            response1 = response1.substring(9);
            professorArrivalTimeSensorValue = parseSensorReadingFromBDUsingUUID(response1);
            professorArrivalTimeSensorValue = professorArrivalTimeSensorValue.substring(0,professorArrivalTimeSensorValue.indexOf(' '));
            https.get(options2, function(res2) {
                res2.on('data', function(chunk2) {
                    response2 += chunk2;
                });
                res2.on('end', function() {
                    response2 = response2.substring(9);
                    cafeQueueLengthSensorValue = parseSensorReadingFromBDUsingUUID(response2);
                    https.get(options3, function(res3) {
                        res3.on('data', function(chunk3) {
                            response3 += chunk3;
                        });
                        res3.on('end', function() {
                            response3 = response3.substring(9);
                            timeBeforeMeetingSensorValue = parseSensorReadingFromBDUsingUUID(response3);
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
                            https.get(options4, function(res4) {
                                res4.on('data', function(chunk4) {
                                response4 += chunk4;
                                });
                                res4.on('end', function() {
                                    response4 = response4.substring(9);
                                    yourArrivalTimeToCafeSensorValue = parseSensorReadingFromBDUsingUUID(response4);
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
                            }).on('error', function(e4) {
                                console.log("Got error: " + e4.message);
                                eventCallback("Something wrong with the URL or with the website. Please check that and proceed");
                            });
                        });
                    }).on('error', function(e3) {
                        console.log("Got error: " + e3.message);
                        eventCallback("Something wrong with the URL or with the website. Please check that and proceed");
                    });
                });
            }).on('error', function(e2) {
                console.log("Got error: " + e2.message);
                eventCallback("Something wrong with the URL or with the website. Please check that and proceed");
            });
        });
    }).on('error', function(e1) {
        console.log("Got error: " + e1.message);
        eventCallback("Something wrong with the URL or with the website. Please check that and proceed");
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


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the CrisisBuff Skill.
    var skill = new CrisisBuffSkill();
    skill.execute(event, context);
};