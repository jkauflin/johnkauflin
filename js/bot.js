/*==============================================================================
 * (C) Copyright 2017,2018,2019,2021 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION: Client-side JS functions and logic for JohnBot2
 *----------------------------------------------------------------------------
 * Modification History
 * 2017-09-08 JJK   Initial version 
 * 2017-12-29 JJK	Initial controls and WebSocket communication
 * 2017-01-21 JJK	Implementing response to buttons for manual controls
 * 2018-12-07 JJK	Re-factor to use modules
 * 2018-12-25 JJK	I'm always thankful on Christmas
 * 2019-01-19 JJK	Change back to search using web site database and new
 * 					fuzzy match algorithm
 * 2019-02-01 JJK	Implement command check on spoken text
 * 					Working on activity loop
 * 2019-02-08 JJK	Implementing jokes query and cache
 * 2019-02-09 JJK	Implementing robotCommand, and getUserName
 * 2019-02-10 JJK	Moved manual controls to seperate module
 * 2019-02-11 JJK	Added button to Start interaction (and ask for name)
 * 2019-02-16 JJK	Added walkAbout and Stop button
 * 2019-02-23 JJK   Implementing rivescript for bot responses (after watching
 *                  Coding Train chatbot videos)
 * 2019-03-29 JJK   Added seperate jokes.rive and eliza.rive
 * 2019-04-21 JJK   Added handling for bot music commands
 * 2020-05-10 JJK   Checking music functions
 * 2020-05-25 JJK   Working on brain and responses
 * 2021-01-25 JJK   Implementing JokeBot
 * 2021-04-13 JJK   Added logic to get userName from brain reply
 *============================================================================*/
var bot = (function () {
    'use strict'; // Force declaration of variables before use (among other things)
    //=================================================================================================================
    // Private variables for the Module
    var env;
    var ws = null;
    var wsConnected = false;
    var isTouchDevice = false;
    var date;
    var userName = '';
    var getUserName = false;
    var confirmName = false;
    var speaking = false;
    var botImgEyesOFF = "Media/images/botImage.jpg";
    var botImgEyesON = "Media/images/botEyesRed.jpg";

    // Create our RiveScript interpreter.
    var brain = new RiveScript();

    //=================================================================================================================
    // Variables cached from the DOM
    var $document = $(document);
    var $logMessage = $document.find("#logMessage");
    var $StatusDisplay = $document.find("#StatusDisplay");

    var $StartButton = $document.find("#StartButton");
    var $StopButton = $document.find("#StopButton");
    var $RestartButton = $document.find("#RestartButton");
    var $SearchButton = $document.find("#SearchButton");
    var $SearchInput = $document.find("#SearchInput");
    var $searchStr = $document.find("#searchStr");

    var $BotImage = $document.find("#BotImage");

    //=================================================================================================================
    // Bind events
    isTouchDevice = 'ontouchstart' in document.documentElement;

    if (!isTouchDevice) {
        $SearchInput.change(_searchResponses);
    } else {
        $SearchButton.click(_searchResponses);
    }

    $StartButton.click(_startInteraction);
    $StopButton.click(_stop);
    $RestartButton.click(_restart);

    //=================================================================================================================
    // Module methods
    function logMessage(message) {
        console.log(message);
        //$logMessage.html(message);
    }

    /**
     * Get the user IP throught the webkitRTCPeerConnection
     * @param onNewIP {Function} listener function to expose the IP locally
     * @return undefined
     */
    function getUserIP(onNewIP) { //  onNewIp - your listener function for new IPs
        //compatibility for firefox and chrome
        var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        var pc = new myPeerConnection({
            iceServers: []
        }),
        noop = function() {},
        localIPs = {},
        ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
        key;

        function iterateIP(ip) {
            if (!localIPs[ip]) onNewIP(ip);
            localIPs[ip] = true;
        }

         //create a bogus data channel
        pc.createDataChannel("");

        // create offer and set local description
        pc.createOffer().then(function(sdp) {
            sdp.sdp.split('\n').forEach(function(line) {
                if (line.indexOf('candidate') < 0) return;
                line.match(ipRegex).forEach(iterateIP);
            });
            
            pc.setLocalDescription(sdp, noop, noop);
        }).catch(function(reason) {
            // An error occurred, so handle the failure to connect
        });

        //listen for candidate events
        pc.onicecandidate = function(ice) {
            if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
            ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
        };
    }

    // Usage
    //getUserIP(function(ip){
    //    alert("Got IP! :" + ip);
    //});


    // Load our RiveScript files from the brain folder.
    brain.loadFile([
        "js/brain/begin.rive",
        //        "js/brain/eliza.rive",
        //        "js/brain/admin.rive",
        "js/brain/main.rive",
        "js/brain/jokes.rive",
        //        "js/brain/clients.rive",
        //        "js/brain/myself.rive",
        "js/brain/javascript.rive"
    ]).then(onReady).catch(onError);

    //    brain.parse()   // dynamically parse and load script?
    // https://github.com/aichaos/rivescript-js/blob/master/docs/rivescript.md\

    function onReady() {
        // Now to sort the replies!
        brain.sortReplies();
        console.log("Brain loaded and sorted");
    }

    function onError(err, filename, lineno) {
        console.log("err = " + err);
    }
    // You can register objects that can then be called
    // using <call></call> syntax
    /*
    brain.setSubroutine('fancyJSObject', function (rs, args) {
        // doing complex stuff here
    });
    */

    // General function to send the botMessageStr to the server if Websocket is connected
    function sendCommand(botMessageStr) {
        //console.log("in sendCommand, wsConnected = "+wsConnected);
        /*
        if (wsConnected) {
            console.log(">>> sendCommand, botMessage = " + botMessageStr);
            ws.send(botMessageStr);
        }
        */
    }

    function _startInteraction() {
        getUserName = true;
        sayAndAnimate("Hello, I am the Joke bought.  What is your name?");
        //sendCommand('{"walk":1}');
    }

    function _stop() {
        //sendCommand('{"stop":1}');
        //music.stop();
        speech.stopAll();
        _doneSpeaking();
        // figure out a way to stop the eyes from strobing
    }

    function _restart() {
        //sendCommand('{"restart":1}');
    }

    function _searchResponses() {
        //console.log("searchStr = " + $searchStr.val());
        handleTextFromSpeech($searchStr.val());
        $searchStr.val('');
    }

    function _getRandomInt(min, max) {
        // Floor - rounded down to the nearest integer
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // Respond to string recognized by speech to text (or from search input text box)
    function handleTextFromSpeech(speechText) {
        //console.log(" in handleTextFromSpeech, speechText = " + speechText);

        if (getUserName) {
            getUserName = false;
            userName = speechText;
            // Add the phrase and send it into bot brain to check reply
            speechText = "my name is " + userName;
        }

        // Call the RiveScript interpreter to get a reply
        brain.reply("username", speechText, this).then(function (reply) {
            console.log("brain reply = " + reply);
            
            if (reply.search("I will remember to call you ")) {
                userName = reply.replace("I will remember to call you ","");
                console.log(">>> userName = "+userName);
            }

            var commandFound = reply.search("botcommand");
            if (commandFound >= 0) {
                //_executeBotCommands(reply.substr(commandFound + 11));

                // Let's assume if it's a bot command, we don't want to speak as well
                //var textToSpeak = reply.substr(0,commandFound-1);
                // 2019-04-19 JJK - Let's trying doing the speaking part too
                // (if there is something to say)
                //if (textToSpeak)
                //sayAndAnimate(reply.substr(0, commandFound - 1));
                speech.startRecognizing();
            } else {
                sayAndAnimate(reply);
            }
        }).catch(function (e) {
            console.log(e);
        });

    } // function handleTextFromSpeech(speechText) {

    function _executeBotCommands(cmdStr) {
        if (cmdStr == "stop") {
            sendCommand('{"stop":1}');
            music.stop();
        } else if (cmdStr.substr(0, 4) == "walk") {
            sendCommand('{"walk":1, "walkCommand":"' + cmdStr.substr(5) + '"}');
        } else if (cmdStr.search("rotate") >= 0) {
            var tempDegrees = cmdStr.substr(7);
            if (tempDegrees == null || tempDegrees == '') {
                tempDegrees = "180";
            } else if (tempDegrees == 'around') {
                tempDegrees = "180";
            }
            sendCommand('{"rotate":1,"rotateDirection":"R","rotateDegrees":' + tempDegrees + '}');
        } else if (cmdStr.search("play") >= 0) {
            if (cmdStr.search("play-artist-track") >= 0) {
                // play-artist-track <star> by <star2>
                // 18, then by and end
            }
            else if (cmdStr.search("play-artist") >= 0) {
                // play-artist <star>
                music.searchAndPlay(cmdStr.substr(12), "artist");
            }
            else if (cmdStr.search("play-album") >= 0) {
                music.searchAndPlay(cmdStr.substr(11), "album");
            }
            else if (cmdStr.search("playlist") >= 0) {
                // playlist <star>
                music.searchAndPlay(cmdStr.substr(9), "playlist");
            }
            else if (cmdStr.length > 7) {
                music.searchAndPlay(cmdStr.substr(5), "track");
            } else {
                music.play();
            }
        } else if (cmdStr.search("music stop") >= 0) {
            music.stop();
        }
    } // function _executeBotCommands(cmdStr) {

    var eyesON = false;
    function sayAndAnimate(textToSpeak) {
        // Ask the speech module to say the response text
        $("#VerbalRepsonse").html(textToSpeak);
        speech.speakText(textToSpeak);

        //_animateSpeech(textToSpeak);
        // Cancel any running animations before starting a new one
        _doneSpeaking();
        // How?

        // (just calculate using the word count for now)
        var wordList = textToSpeak.split(" ");
        _flashEyes((wordList.length * 2), 0);
    }

    function _flashEyes(totalSegments, i) {
        if (eyesON) {
            $BotImage.attr("src", botImgEyesOFF);
            eyesON = false;
        } else {
            $BotImage.attr("src", botImgEyesON);
            eyesON = true;
        }
        // future - get smarter and make 150 the length of each word
        if (i < totalSegments-1) {
            setTimeout(_flashEyes, 150, totalSegments, i + 1)
        } else {
            $BotImage.attr("src", botImgEyesOFF);
            eyesON = false;
        }
    }

    function _doneSpeaking() {
        $BotImage.attr("src", botImgEyesOFF);
        eyesON = false;
        speaking = false;
        clearTimeout(_doneSpeaking);
        clearTimeout(_flashEyes);
    }

    //=================================================================================================================
    // This is what is exposed from this Module
    return {
        sendCommand,
        sayAndAnimate,
        handleTextFromSpeech
    };

})(); // var bot = (function(){
