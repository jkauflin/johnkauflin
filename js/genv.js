/*==============================================================================
 (C) Copyright 2023 John J Kauflin, All rights reserved. 
 ----------------------------------------------------------------------------
 DESCRIPTION:  Genv UI to interact with the server database
 ----------------------------------------------------------------------------
 Modification History
 2023-09-14 JJK  Initial version 
 2023-09-16 JJK  Added WaterOn request 
 2023-09-27 JJK  Added Selfie function
 2023-09-29 JJK  Added update of dates based on planting date
 2023-11-25 JJK  Modified the Selfie function to get images from the new table
 2024-02-09 JJK  Updated for display changes
 *============================================================================*/

 var configDesc = document.getElementById("configDesc")
 var daysToGerm = document.getElementById("daysToGerm")
 var daysToBloom = document.getElementById("daysToBloom")
 var germinationStart = document.getElementById("germinationStart")
 var plantingDate = document.getElementById("plantingDate")
 var harvestDate = document.getElementById("harvestDate")
 var cureDate = document.getElementById("cureDate")
 var productionDate = document.getElementById("productionDate")
 var targetTemperature = document.getElementById("targetTemperature")
 var currTemperature = document.getElementById("currTemperature")
 //var airInterval = document.getElementById("airInterval")
 //var airDuration = document.getElementById("airDuration")
 var heatInterval = document.getElementById("heatInterval")
 var heatDuration = document.getElementById("heatDuration")
 //var lightDuration =  document.getElementById("lightDuration")
 var waterInterval = document.getElementById("waterInterval")
 var waterDuration = document.getElementById("waterDuration")
 var lastWaterTs = document.getElementById("lastWaterTs")
 var lastWaterSecs = document.getElementById("lastWaterSecs")
 var configCheckInterval = document.getElementById("configCheckInterval")

 var lastUpdateTs = document.getElementById("lastUpdateTs")
 var updateDisplay = document.getElementById("UpdateDisplay")
 var imgDisplay = document.getElementById("ImgDisplay")
 var returnMessage = document.getElementById("returnMessage")

 var getDataButton = document.getElementById("GetDataButton")
 var updateButton = document.getElementById("UpdateButton")
 var waterButton = document.getElementById("WaterButton")
 //var GetSelfieButton = document.getElementById("GetSelfieButton")

var returnMessage = document.getElementById("returnMessage")
//var frameIntervalInput = document.getElementById("frameIntervalInput")

var GetImagesButton = document.getElementById("GetImagesButton")
var ImgBackwardButton = document.getElementById("ImgBackwardButton")
var ImgPlayButton = document.getElementById("ImgPlayButton")
var ImgStopButton = document.getElementById("ImgStopButton")
var ImgForwardButton = document.getElementById("ImgForwardButton")

var currImg = 0
var imgArray = []
var frameIntervalMs = 70
//frameIntervalInput.value = frameIntervalMs
var stopImagePlay = false


//=================================================================================================================
// Bind events
getDataButton.addEventListener("click", _lookup);
updateButton.addEventListener("click", _update);
waterButton.addEventListener("click", _water);
GetImagesButton.addEventListener("click", _getImages);
//ImgBackwardButton.addEventListener("click", _backwardImages);
ImgPlayButton.addEventListener("click", _playImages);
//ImgStopButton.addEventListener("click", _stopImages);
ImgForwardButton.addEventListener("click", _forwardImages);

var jjkloginEventElement = document.getElementById("jjkloginEventElement")
jjkloginEventElement.addEventListener('userJJKLoginAuth', function (event) {
    if (event.detail.userLevel >= 9) {
        getDataButton.disabled = false
        updateButton.disabled = false
        waterButton.disabled = false
        GetImagesButton.disabled = false
        //ImgBackwardButton.disabled = false
        ImgPlayButton.disabled = false
        //ImgStopButton.disabled = false
        ImgForwardButton.disabled = false
    }
})


//=================================================================================================================
// Module methods
function _lookup(event) {
    let url = 'js/genvGetInfo.php';
    fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Response was not OK');
        }
        return response.json();
    })
    .then(data => {
        updateDisplay.innerHTML = ""
        _renderConfig(data);
    })
    .catch((err) => {
        console.error(`Error in Fetch to ${url}, ${err}`);
        updateDisplay.innerHTML = "Fetch data FAILED - check log";
    });
}

function paddy(num, padlen, padchar) {
    var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    var pad = new Array(1 + padlen).join(pad_char);
    return (pad + num).slice(-pad.length);
}

function _addDays(inDate, days) {
    let td = new Date(inDate)
    td.setDate(td.getDate() + (parseInt(days)+1))
    let tempMonth = td.getMonth() + 1
    let tempDay = td.getDate()
    let outDate = td.getFullYear() + '-' + paddy(tempMonth,2) + '-' + paddy(tempDay,2)
    return outDate;
}

function _update(event) {
    // Update other dates based on planting date
    harvestDate.value = _addDays(plantingDate.value,daysToBloom.value)
    cureDate.value = _addDays(harvestDate.value,14)
    productionDate.value = _addDays(cureDate.value,14)

    let url = 'js/genvUpdateInfo.php';
    let paramData = {
        configDesc: configDesc.value,
        daysToBloom: daysToBloom.value,
        daysToGerm: daysToGerm.value,
        germinationStart: germinationStart.value,
        plantingDate: plantingDate.value,
        harvestDate: harvestDate.value,
        cureDate: cureDate.value,
        productionDate: productionDate.value,
        targetTemperature: targetTemperature.value,
        heatInterval: heatInterval.value,
        heatDuration: heatDuration.value,
        waterDuration: waterDuration.value,
        waterInterval: waterInterval.value,
        configCheckInterval: configCheckInterval.value,
        requestCommand: ""
    }
    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(paramData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Response was not OK');
        }
        return response.text();
    })
    .then(returnMsg => {
        updateDisplay.innerHTML = "Update successful "+returnMsg;
    })
    .catch((err) => {
        console.error(`Error in Fetch to ${url}, ${err}`);
        updateDisplay.innerHTML = "Fetch data FAILED - check log";
    });
}

function _water(event) {
    let url = 'js/genvUpdateInfo.php';
    let paramData = {
        requestCommand: "WaterOn",
        requestValue: document.getElementById("waterSeconds").value}
    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(paramData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Response was not OK');
        }
        return response.text();
    })
    .then(message => {
        updateDisplay.innerHTML = message;
    })
    .catch((err) => {
        console.error(`Error in Fetch to ${url}, ${err}`);
        updateDisplay.innerHTML = "Fetch data FAILED - check log";
    });
}

function _getImages(event) {
    updateDisplay.innerHTML = "Getting images..."

    // # of images to get (100)
    // start date

    let url = 'js/genvGetSelfie.php';
    let paramData = {
        frameIntervalMs: frameIntervalMs
    }
    fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(paramData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Response was not OK');
        }
        return response.json();
    })
    .then(data => {
        //console.log("Got the images")
        imgArray = data
        currImg = 0
        displayImage()
    })
    .catch((err) => {
        console.error(`Error in Fetch to ${url}, ${err}`)
        updateDisplay.innerHTML = "Fetch data FAILED - check log"
    })
}

function displayImage() {
    // {imgId: 1221, lastChangeTs: '2024-01-04 00:56:06', imgData: '
    updateDisplay.innerHTML = "ImgTS: "+imgArray[currImg].lastChangeTs+" ("+imgArray[currImg].imgId+")"
    imgDisplay.src = imgArray[currImg].imgData
}

function loopImages() {
    displayImage()
    if (currImg < imgArray.length-1 && !stopImagePlay) {
        currImg++
        setTimeout(loopImages,frameIntervalMs)
    }
}

function _playImages() {
    /*
    if (frameIntervalInput != null) {
        if (frameIntervalInput.value > 0) {
            frameIntervalMs = frameIntervalInput.value
        }
    }
    */
    currImg = 0
    stopImagePlay = false
    loopImages()
}

function _stopImages() {
    if (stopImagePlay) {
        // If already stopped, go to the beginning
        currImg = 0
        displayImage()
    } else {
        stopImagePlay = true
    }
}

function _backwardImages() {
    if (currImg > 0) {
        currImg--
        displayImage()
    } else if (currImg == 0) {
        currImg = imgArray.length-1
        displayImage()
    }
}

function _forwardImages() {
    if (currImg < imgArray.length-1) {
        currImg++
        displayImage()
    } else if (currImg == imgArray.length-1) {
        currImg = 0
        displayImage()
    }
}

function _renderConfig(sr) {
    if (sr != null) {
        configDesc.value = sr.ConfigDesc
        daysToGerm.value = sr.DaysToGerm
        daysToBloom.value = sr.DaysToBloom
        germinationStart.value = sr.GerminationStart
        plantingDate.value = sr.PlantingDate
        harvestDate.value = sr.HarvestDate
        cureDate.value = sr.CureDate
        productionDate.value = sr.ProductionDate
        configCheckInterval.value = sr.ConfigCheckInterval
        // sr.logMetricInterval  minutes for selfie
        targetTemperature.value = sr.TargetTemperature
        currTemperature.value = sr.CurrTemperature
        //airInterval.value = sr.AirInterval
        //airDuration.value = sr.AirDuration
        heatInterval.value = sr.HeatInterval
        heatDuration.value = sr.HeatDuration
        //lightDuration.value = sr.LightDuration
        waterInterval.value = sr.WaterInterval
        waterDuration.value = sr.WaterDuration

        lastUpdateTs.value = sr.LastUpdateTs
        lastWaterTs.value = sr.LastWaterTs
        lastWaterSecs.value = sr.LastWaterSecs

        returnMessage.value = sr.ReturnMessage
    }
}
