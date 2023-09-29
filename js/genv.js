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
var tempImg = document.getElementById("SelfieImg")
var updateDisplay = document.getElementById("UpdateDisplay")

var getDataButton = document.getElementById("GetDataButton")
var updateButton = document.getElementById("UpdateButton")
var waterButton = document.getElementById("WaterButton")
var selfieButton = document.getElementById("SelfieButton")

//=================================================================================================================
// Bind events
getDataButton.addEventListener("click", _lookup);
updateButton.addEventListener("click", _update);
waterButton.addEventListener("click", _water);
selfieButton.addEventListener("click", _selfie);

var jjkloginEventElement = document.getElementById("jjkloginEventElement")
jjkloginEventElement.addEventListener('userJJKLoginAuth', function (event) {
    if (event.detail.userLevel >= 9) {
        getDataButton.disabled = false
        updateButton.disabled = false
        waterButton.disabled = false
        selfieButton.disabled = false
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

    let url = 'js/genvUpdateInfo.php';
    let paramData = {
        configDesc: configDesc.value,
        daysToBloom: daysToBloom.value,
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

function _selfie(event) {
    let url = 'js/genvUpdateInfo.php';
    let paramData = {
        requestCommand: "Selfie",
        requestValue: ""}
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

function _renderConfig(storeRec) {
    if (storeRec != null) {
        configDesc.value = storeRec.ConfigDesc
        daysToGerm.value = storeRec.DaysToGerm
        daysToBloom.value = storeRec.DaysToBloom
        germinationStart.value = storeRec.GerminationStart
        plantingDate.value = storeRec.PlantingDate
        harvestDate.value = storeRec.HarvestDate
        cureDate.value = storeRec.CureDate
        productionDate.value = storeRec.ProductionDate
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

        tempImg.src = storeRec.TempImg
    }
}
