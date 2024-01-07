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
//vardocument.getElementById("airInterval").value = storeRec.AirInterval;
//vardocument.getElementById("airDuration").value = storeRec.AirDuration;
var heatInterval = document.getElementById("heatInterval")
var heatDuration = document.getElementById("heatDuration")
//var document.getElementById("heatDurationMin").value = storeRec.HeatDurationMin;
//var document.getElementById("heatDurationMax").value = storeRec.HeatDurationMax;
var lightDuration =  document.getElementById("lightDuration")
var waterInterval = document.getElementById("waterInterval")
var waterDuration = document.getElementById("waterDuration")
var configCheckInterval = document.getElementById("configCheckInterval")
var returnMessage = document.getElementById("returnMessage")
var imgDisplay = document.getElementById("ImgDisplay")
var updateDisplay = document.getElementById("UpdateDisplay")
var frameIntervalInput = document.getElementById("frameIntervalInput")

var getDataButton = document.getElementById("GetDataButton")
var updateButton = document.getElementById("UpdateButton")
var waterButton = document.getElementById("WaterButton")
var GetImagesButton = document.getElementById("GetImagesButton")
var ImgBackwardButton = document.getElementById("ImgBackwardButton")
var ImgPlayButton = document.getElementById("ImgPlayButton")
var ImgStopButton = document.getElementById("ImgStopButton")
var ImgForwardButton = document.getElementById("ImgForwardButton")

var currImg = 0
var imgArray = []
var frameIntervalMs = 70
frameIntervalInput.value = frameIntervalMs
var stopImagePlay = false

/* >>>>> can't set the width to a percentage in js, only pixels
if (window.innerHeight < window.innerWidth){
    imgDisplay = '70%'
} else {
    imgDisplay.width = '90%'
}
*/

//=================================================================================================================
// Bind events
getDataButton.addEventListener("click", _lookup);
updateButton.addEventListener("click", _update);
waterButton.addEventListener("click", _water);
GetImagesButton.addEventListener("click", _getImages);
ImgBackwardButton.addEventListener("click", _backwardImages);
ImgPlayButton.addEventListener("click", _playImages);
ImgStopButton.addEventListener("click", _stopImages);
ImgForwardButton.addEventListener("click", _forwardImages);


var jjkloginEventElement = document.getElementById("jjkloginEventElement")
jjkloginEventElement.addEventListener('userJJKLoginAuth', function (event) {
    if (event.detail.userLevel >= 9) {
        getDataButton.disabled = false
        updateButton.disabled = false
        waterButton.disabled = false
        GetImagesButton.disabled = false
        ImgBackwardButton.disabled = false
        ImgPlayButton.disabled = false
        ImgStopButton.disabled = false
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
        _renderConfig(data);
        //console.log("TargetTemperature = "+data.TargetTemperature)
        updateDisplay.innerHTML = "Last Update: "+data.LastUpdateTs;
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
    var td = new Date(inDate)
    td.setDate(td.getDate() + days)
    let tempMonth = td.getMonth() + 1
    let tempDay = td.getDate()
    let outDate = td.getFullYear() + '-' + paddy(tempMonth,2) + '-' + paddy(tempDay,2)
    return outDate;
}

function _update(event) {
    // Update other dates based on planting date
    harvestDate.value = _addDays(plantingDate.value,75)
    cureDate.value = _addDays(harvestDate.value,14)
    productionDate.value = _addDays(cureDate.value,14)

//    var daysToGerm = document.getElementById("daysToGerm")
//var daysToBloom = document.getElementById("daysToBloom")

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
        lightDuration: lightDuration.value,
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
    if (frameIntervalInput != null) {
        if (frameIntervalInput.value > 0) {
            frameIntervalMs = frameIntervalInput.value
        }
    }

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



function _renderConfig(storeRec) {
    if (storeRec != null) {
        configDesc.value = storeRec.ConfigDesc
        daysToGerm.value = storeRec.DaysToGerm
        daysToBloom.value = storeRec.DaysToBloom
        germinationStart.value = storeRec.GerminationStart
        harvestDate.value = storeRec.HarvestDate
        cureDate.value = storeRec.CureDate
        productionDate.value = storeRec.ProductionDate
        plantingDate.value = storeRec.PlantingDate
        targetTemperature.value = storeRec.TargetTemperature
        currTemperature.value = storeRec.CurrTemperature
        //document.getElementById("airInterval").value = storeRec.AirInterval
        //document.getElementById("airDuration").value = storeRec.AirDuration
        heatInterval.value = storeRec.HeatInterval
        heatDuration.value = storeRec.HeatDuration
        //document.getElementById("heatDurationMin").value = storeRec.HeatDurationMin
        //document.getElementById("heatDurationMax").value = storeRec.HeatDurationMax
        lightDuration.value = storeRec.LightDuration
        waterInterval.value = storeRec.WaterInterval
        waterDuration.value = storeRec.WaterDuration
        configCheckInterval.value = storeRec.ConfigCheckInterval
        returnMessage.value = storeRec.ReturnMessage
    }
}
