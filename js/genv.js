/*==============================================================================
 (C) Copyright 2023 John J Kauflin, All rights reserved. 
 ----------------------------------------------------------------------------
 DESCRIPTION:  Genv UI to interact with the server database
 ----------------------------------------------------------------------------
 Modification History
 2023-09-14 JJK  Initial version 
 2023-09-16 JJK  Added WaterOn request 
 *============================================================================*/

var getDataButton = document.getElementById("GetDataButton")
var updateButton = document.getElementById("UpdateButton")
var waterButton = document.getElementById("WaterButton")

    //=================================================================================================================
    // Bind events
    //document.getElementById("ClearLogButton").addEventListener("click", _clearLog);
    getDataButton.addEventListener("click", _lookup);
    updateButton.addEventListener("click", _update);
    waterButton.addEventListener("click", _water);

    var jjkloginEventElement = document.getElementById("jjkloginEventElement")
    jjkloginEventElement.addEventListener('userJJKLoginAuth', function (event) {
        if (event.detail.userLevel >= 9) {
            getDataButton.disabled = false
            updateButton.disabled = false
            waterButton.disabled = false
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
            document.getElementById("UpdateDisplay").innerHTML = "Last Update: "+data.LastUpdateTs;
        })
        .catch((err) => {
            console.error(`Error in Fetch to ${url}, ${err}`);
            document.getElementById("UpdateDisplay").innerHTML = "Fetch data FAILED - check log";
        });
    }

    function _update(event) {
        let url = 'js/genvUpdateInfo.php';
        let paramData = {
            configDesc: document.getElementById("configDesc").value,
            daysToBloom: document.getElementById("daysToBloom").value,
            germinationStart: document.getElementById("germinationStart").value,
            plantingDate: document.getElementById("plantingDate").value,
            targetTemperature: document.getElementById("targetTemperature").value,
            heatInterval: document.getElementById("heatInterval").value,
            heatDuration: document.getElementById("heatDuration").value,
            lightDuration: document.getElementById("lightDuration").value,
            waterDuration: document.getElementById("waterDuration").value,
            waterInterval: document.getElementById("waterInterval").value,
            configCheckInterval: document.getElementById("configCheckInterval").value,
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
            document.getElementById("UpdateDisplay").innerHTML = "Update successful "+returnMsg;
            //_renderConfig(data);
        })
        .catch((err) => {
            console.error(`Error in Fetch to ${url}, ${err}`);
            document.getElementById("UpdateDisplay").innerHTML = "Fetch data FAILED - check log";
        });
    }


/*
function _addDays(inDate, days) {
    var td = new Date(inDate)
    td.setDate(td.getDate() + days)
    let tempMonth = td.getMonth() + 1
    let tempDay = td.getDate()
    let outDate = td.getFullYear() + '-' + paddy(tempMonth,2) + '-' + paddy(tempDay,2)
    return outDate;
}

function updateConfig(inStoreRec) {
    let prevPlantingDate = sr.plantingDate
    sr = inStoreRec

    // If the planting date changes, update the other dates based on the new date
    if (sr.plantingDate != prevPlantingDate) {
        sr.harvestDate = _addDays(sr.plantingDate,75)
        sr.cureDate = _addDays(sr.harvestDate,14)
        sr.productionDate = _addDays(sr.cureDate,14)
    }

    //log("updateConfig, targetTemperature = " + sr.targetTemperature)
    TEMPATURE_MAX = sr.targetTemperature + 1.0
    TEMPATURE_MIN = sr.targetTemperature - 1.0
    _saveStoreRec()
}

*/


//RequestCommand "WaterOn"

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
            document.getElementById("UpdateDisplay").innerHTML = message;
        })
        .catch((err) => {
            console.error(`Error in Fetch to ${url}, ${err}`);
            document.getElementById("UpdateDisplay").innerHTML = "Fetch data FAILED - check log";
        });
    }

    function _renderConfig(storeRec) {
        if (storeRec != null) {
            document.getElementById("configDesc").value = storeRec.ConfigDesc;
            document.getElementById("daysToGerm").value = storeRec.DaysToGerm;
            document.getElementById("daysToBloom").value = storeRec.DaysToBloom;
            document.getElementById("germinationStart").value = storeRec.GerminationStart;
            document.getElementById("plantingDate").value = storeRec.PlantingDate;
            document.getElementById("harvestDate").value = storeRec.HarvestDate;
            document.getElementById("cureDate").value = storeRec.CureDate;
            document.getElementById("productionDate").value = storeRec.ProductionDate;
            document.getElementById("targetTemperature").value = storeRec.TargetTemperature;
            document.getElementById("currTemperature").value = storeRec.CurrTemperature;
            //document.getElementById("airInterval").value = storeRec.AirInterval;
            //document.getElementById("airDuration").value = storeRec.AirDuration;
            document.getElementById("heatInterval").value = storeRec.HeatInterval;
            document.getElementById("heatDuration").value = storeRec.HeatDuration;
            //document.getElementById("heatDurationMin").value = storeRec.HeatDurationMin;
            //document.getElementById("heatDurationMax").value = storeRec.HeatDurationMax;
            document.getElementById("lightDuration").value = storeRec.LightDuration;
            document.getElementById("waterInterval").value = storeRec.WaterInterval;
            document.getElementById("waterDuration").value = storeRec.WaterDuration;
            document.getElementById("configCheckInterval").value = storeRec.ConfigCheckInterval;
            document.getElementById("returnMessage").value = storeRec.ReturnMessage;
        }

    }
