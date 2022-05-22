/*==============================================================================
 * (C) Copyright 2015,2016,2017,2022 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION:  Common JS functions for any web app to augment bootstrap
 *               displays and form field/update functions
 *----------------------------------------------------------------------------
 * Modification History
 * 2015-03-06 JJK 	Initial version 
 * 2015-04-09 JJK   Added Regular Expressions and functions for validating
 * 					email addresses and replacing non-printable characters
 * 2016-05-18 JJK   Added setTextArea
 * 2016-08-14 JJK   Imported data from Access backup of 8/12/2016
 * 2016-08-26 JJK   Went live, and Paypal payments working in Prod!!!
 * 2018-10-14 JJK   Re-factored for modules
 * 2018-10-27 JJK   Modified getJSONfromInputs to just loop through the DIV
 *                  looking for input fields, and added an action parameter
 * 2018-10-28 JJK   Went back to declaring variables in the functions
 * 2018-11-01 JJK   Modified getJSONfromInputs to only include elements with
 *                  an Id and check for checkbox "checked"
 * 2018-12-19 JJK   Added functions to abstract screen activities such as
 *                  display, search, edit, and update
 * 2019-09-28 JJK   Modified the JSON inputs method to accept DEV object
 *                  or name string.  Modified the AJAX calls to use new
 *                  promises to check result
 * 2022-05-15 JJK   Updating for bootstrap 5 and Fetch (and to be a good
 *                  general set of utility function for any web app).
 *                  Removed email address regedit (bootstrap 5 validates)
 *                  Removed cursor stuff
 * 2022-05-18 JJK   Added 2 functions (updateJSONfromInputs, updateTEXTfromInputs)
 *                  to handle Update requests to services using Fetch with POST 
 *                  and JSON structure in Request body.  Makes use of the existing
 *                  getJSONfromInputs function, and it does the thing I have
 *                  always wanted to which is to parse the response to see if
 *                  it is JSON or non-JSON if there was some kind of Exception.
 *                  *** Philosophy is to NOT count on elements in the UI DOM,
 *                  but to pass elements to functions if we want them to set
 *                  display elements in the DOM.  The update functions will
 *                  write details to the console.log and pop-up alerts if
 *                  a display element is not specified.
 *                  Added fetchData along the same pattern lines
 *============================================================================*/
 var util = (function(){
    'use strict';  // Force declaration of variables before use (among other things)
    //=================================================================================================================
    // Private variables for the Module

    //=================================================================================================================
    // Variables cached from the DOM

    //=================================================================================================================
    // Bind events

    //=================================================================================================================
    // Module methods
    function currTime() {
        const options = {
            //timeZone: "Africa/Accra",
            //hour12: true,
            //hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        };

        var tempDate = new Date();
        return tempDate.toLocaleTimeString("en-US", options);
    }

    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

    function urlParam(name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results == null) {
            return null;
        }
        else {
            return results[1] || 0;
        }
    }
    /*
    example.com?param1=name&param2=&id=6
        urlParam('param1');     // name
        urlParam('id');         // 6
        rlParam('param2');      // null
    */

    // Non-Printable characters - Hex 01 to 1F, and 7F
    var nonPrintableCharsStr = "[\x01-\x1F\x7F]";
    // "g" global so it does more than 1 substitution
    var regexNonPrintableChars = new RegExp(nonPrintableCharsStr, "g");
    function cleanStr(inStr) {
        return inStr.replace(regexNonPrintableChars, '');
    }

    // Filter out commas (for CSV outputs)
    var commaHexStr = "[\x2C]";
    var regexCommaHexStr = new RegExp(commaHexStr, "g");
    function csvFilter(inVal) {
        return inVal.toString().replace(regexCommaHexStr, '');
    }

    //Replace every ascii character except decimal and digits with a null, and round to 2 decimal places
    var nonMoneyCharsStr = "[\x01-\x2D\x2F\x3A-\x7F]";
    //"g" global so it does more than 1 substitution
    var regexNonMoneyChars = new RegExp(nonMoneyCharsStr, "g");
    function formatMoney(inAmount) {
        var inAmountStr = '' + inAmount;
        inAmountStr = inAmountStr.replace(regexNonMoneyChars, '');
        return parseFloat(inAmountStr).toFixed(2);
    }

    function formatDate(inDate) {
        var tempDate = inDate;
        if (tempDate == null) {
            tempDate = new Date();
        }
        var tempMonth = tempDate.getMonth() + 1;
        if (tempDate.getMonth() < 9) {
            tempMonth = '0' + (tempDate.getMonth() + 1);
        }
        var tempDay = tempDate.getDate();
        if (tempDate.getDate() < 10) {
            tempDay = '0' + tempDate.getDate();
        }
        return tempDate.getFullYear() + '-' + tempMonth + '-' + tempDay;
    }

    function formatDatetime(inDate) {
        var td = inDate;
        if (td == null) {
            td = new Date();
        }
        var formattedDate = formatDate(td);
        return `${formattedDate} ${td.getHours()}:${td.getMinutes()}:${td.getSeconds()}.${td.getMilliseconds()}`;
    }

    // Helper functions for setting UI components from data
    function setBoolText(inBool) {
        var tempStr = "NO";
        if (inBool) {
            tempStr = "YES";
        }
        return tempStr;
    }
    function setCheckbox(checkVal) {
        var tempStr = '';
        if (checkVal == 1) {
            tempStr = 'checked=true';
        }
        return '<input type="checkbox" ' + tempStr + ' disabled="disabled">';
    }
    //function setCheckboxEdit(checkVal, idName) {
    function setCheckboxEdit(idName, checkVal) {
        var tempStr = '';
        if (checkVal == 1) {
            tempStr = 'checked=true';
        }
        return '<input id="' + idName + '" type="checkbox" ' + tempStr + '>';
    }

/* Bootstrap 5 form input fields
            <form id="InputValues" action="#">
                <div class="row">
                    <div class="col p-0">
                        <div class="form-floating m-1">
                            <input id="targetTemperature" type="number" class="form-control">
                            <label for="targetTemperature">Target temp</label>
                        </div>
                        <div class="form-floating m-1">
                            <input id="desc" type="text" class="form-control">
                            <label for="desc">Description</label>
                        </div>
                        <div class="form-floating m-1">
                            <input id="germinationDate" type="date" class="form-control">
                            <label for="germinationDate">Germination date</label>
                        </div>
                    </div>
                </div><!-- end of row -->
            </form>
*/
    function setInputText(idName, textVal, textSize) {
        return '<input id="' + idName + '" name="' + idName + '" type="text" class="form-control input-sm resetval" value="' + textVal + '" size="' + textSize + '" maxlength="' + textSize + '">';
    }
    function setTextArea(idName, textVal, rows) {
        return '<textarea id="' + idName + '" class="form-control input-sm" rows="' + rows + '">' + textVal + '</textarea>';
    }
    function setInputDate(idName, textVal, textSize) {
        return '<input id="' + idName + '" type="text" class="form-control input-sm Date" value="' + textVal + '" size="' + textSize + '" maxlength="' + textSize + '" placeholder="YYYY-MM-DD">';
    }
    function setSelectOption(optVal, displayVal, selected, bg) {
        var tempStr = '';
        if (selected) {
            tempStr = '<option class="' + bg + '" value="' + optVal + '" selected>' + displayVal + '</option>';
        } else {
            tempStr = '<option class="' + bg + '" value="' + optVal + '">' + displayVal + '</option>';
        }
        return tempStr;
    }


    //=============================================================================================
    // Function to request a JSON data structure for a service url using Fetch instead of AJAX,
    // and handling JSON parse errors, as well as diplay elements and render function call
    // Parameters:
    //   url - path to the service to call
    //   jsonType - boolean indicating expected format of response data (TRUE = JSON, FALSE = TEXT)
    //   messageDiv - DIV (JQuery object or String name) to display status messages
    //   renderFunction - Pointer to a function that will do UI rendering of the JSON object data
    //=============================================================================================
    function fetchData(url, jsonType=true, messageDiv=null, renderFunction=null) {
        // Check if a message element was specified
        var displayMessage = false;
        if (messageDiv !== null) {
            displayMessage = true;
            // Get all the input objects within the DIV
            var MessageDiv;
            if (messageDiv instanceof String) {
                MessageDiv = $("#" + messageDiv);
            } else {
                MessageDiv = messageDiv;
            }
            // Clear out the display message element
            MessageDiv.html("");
        }

        fetch(url)
        .then(response => response.text())
        .then(responseData => {
            // Successful response, check for JSON format
            //console.log('Successful response: ', responseData);
            try {
                if (jsonType) {
                    // Parse the response data to see if it is JSON
                    var jsonObject = JSON.parse(responseData);
                    //console.log("Valid JSON string");
                    // If a render function was specified, render the data in the JSON object
                    if (renderFunction != null) {
                        renderFunction(jsonObject);
                    }
                } else {
                    // if NOT JSON, then display the response TEXT in the message element
                    if (displayMessage) {
                        MessageDiv.html(responseData);
                    }
                }
            } catch (error) {
                console.error(`Error in Fetch data request to ${url}, response = ${responseData}`);
                if (displayMessage) {
                    MessageDiv.html("Fetch data FAILED - check log");
                } else {
                    alert(`Error in request to ${url} - check log`);
                }
            }
        })
        .catch((error) => {
            console.error(`Error in request to ${url}, error = `, error);
            if (displayMessage) {
                MessageDiv.html("Error in Fetch data request - check log");
            } else {
                alert(`Error in Fetch data request to ${url} - check log`);
            }
        });
    }

    //=============================================================================================
    // Function to get all input objects within a DIV, and extra entries from a map
    // and construct a JSON object with names and values (to pass in POST updates)
    // 2018-08-31 JJK - Modified to check for input DIV name string or object
    // Parameters:
    //   inDiv - DIV (JQuery object or String name) with input fields to include in JSON inputs
    //   paramMap - Structure holding extra parameters to include
    //=============================================================================================
    function getJSONfromInputs(inDiv, paramMap) {
        var first = true;
        var jsonStr = '{';

        if (inDiv !== null) {
            // Get all the input objects within the DIV
            var InputsDiv;
            if (inDiv instanceof String) {
                InputsDiv = $("#" + inDiv);
            } else {
                InputsDiv = inDiv;
            }
            var FormInputs = InputsDiv.find("input,textarea,select");

            // Loop through the objects and construct the JSON string
            $.each(FormInputs, function (index) {
                //id = useEmailCheckbox, type = checkbox
                //id = propertyComments, type = text
                // Only include elements that have an "id" in the JSON string
                if (typeof $(this).attr('id') !== 'undefined') {
                    if (first) {
                        first = false;
                    } else {
                        jsonStr += ',';
                    }
                    //console.log("id = " + $(this).attr('id') + ", type = " + $(this).attr("type"));
                    if ($(this).attr("type") == "checkbox") {
                        //console.log("id = " + $(this).attr('id') + ", $(this).prop('checked') = " + $(this).prop('checked'));
                        if ($(this).prop('checked')) {
                            jsonStr += '"' + $(this).attr('id') + '" : 1';
                        } else {
                            jsonStr += '"' + $(this).attr('id') + '" : 0';
                        }
                    } else {
                        jsonStr += '"' + $(this).attr('id') + '" : "' + cleanStr($(this).val()) + '"';
                    }
                }
            });
        }

        if (paramMap !== null) {
            paramMap.forEach(function (value, key) {
                if (first) {
                    first = false;
                } else {
                    jsonStr += ',';
                }
                jsonStr += '"' + key + '" : "' + value + '"';
            });
        }

        jsonStr += '}';
        return jsonStr;
    }

    //=============================================================================================
    // Function to execute an update service using a Fetch POST of a JSON structure and getting
    //      a JSON structure back, with proper error handling on the JSON parse, as well as 
    //      diplay elements and render function call
    // Parameters:
    //   url - path to the service to call
    //   inDiv - DIV (JQuery object or String name) with input fields to include in JSON inputs
    //   jsonType - boolean indicating expected format of response data (TRUE = JSON, FALSE = TEXT)
    //   messageDiv - DIV (JQuery object or String name) to display status messages
    //   renderFunction - Pointer to a function that will do UI rendering of the JSON object data
    //   paramMap - Structure holding extra parameters to include
    //=============================================================================================
    function updateData(url, inDiv, jsonType=true, messageDiv=null, renderFunction=null, paramMap=null) {
        // Check if a message element was specified
        var displayMessage = false;
        if (messageDiv !== null) {
            displayMessage = true;
            // Get all the input objects within the DIV
            var MessageDiv;
            if (messageDiv instanceof String) {
                MessageDiv = $("#" + messageDiv);
            } else {
                MessageDiv = messageDiv;
            }
            MessageDiv.html("");
        }

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: getJSONfromInputs(inDiv, paramMap)
        })
        .then(response => response.text())
        .then(responseData => {
            // Successful response, check for JSON format
            //console.log('Successful response: ', responseData);
            try {
                var returnText = "Update successful";
                if (jsonType) {
                    // Parse the response data to see if it is JSON
                    var jsonObject = JSON.parse(responseData);
                    //console.log("Valid JSON string");
                    // If a render function was specified, render the data in the JSON object
                    if (renderFunction != null) {
                        renderFunction(jsonObject);
                    }
                    // Check if there is a display message in the JSON
                    // if it's not NULL and non-blank use it instead of the general "Update successful" message???
                } else {
                    if (responseData != null && responseData.length > 0) {
                        returnText = responseData;
                    }
                }

                if (displayMessage) {
                    MessageDiv.html(returnText);
                }

            } catch (error) {
                console.error(`Error in request to ${url}, response = ${responseData}`);
                if (displayMessage) {
                    MessageDiv.html("Update FAILED - check log");
                } else {
                    alert(`Error in request to ${url} - check log`);
                }
            }
        })
        .catch((error) => {
            console.error(`Error in request to ${url}, error = `, error);
            if (displayMessage) {
                MessageDiv.html("Error in Update - check log");
            } else {
                alert(`Error in request to ${url} - check log`);
            }
        });
    }

    function log(inStr) {
        console.log(formatDatetime + " " + inStr);
    }
    
    //=================================================================================================================
    // This is what is exposed from this Module
    return {
        sleep,
        urlParam,
        cleanStr,
        csvFilter,
        formatMoney,
        formatDate,
        formatDate,
        formatDatetime,
        setBoolText,
        setCheckbox,
        setCheckboxEdit,
        setInputText,
        setTextArea,
        setInputDate,
        setSelectOption,
        fetchData,
        getJSONfromInputs,
        updateData,
        log
    };
        
})(); // var util = (function(){
