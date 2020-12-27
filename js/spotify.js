/*==============================================================================
 * (C) Copyright 2020 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION: 
 *----------------------------------------------------------------------------
 * Modification History
 * 2020-12-17 JJK 	Initial version
 *============================================================================*/
var spotify = (function () {
	'use strict';  // Force declaration of variables before use (among other things)
	//=================================================================================================================
	// Private variables for the Module

	//=================================================================================================================
	// Variables cached from the DOM
	var $document = $(document);
    var $jjkloginEventElement = $document.find('#jjkloginEventElement')
    var $PlaylistNav = $document.find('PlaylistNav');

    $jjkloginEventElement.on('userJJKLoginAuth', function (event) {
        console.log('After login, username = ' + event.originalEvent.detail.userName);
        if (event.originalEvent.detail.userLevel > 5) {
            console.log("user auth, remove d-none from PlaylistNav");
            $PlaylistNav.removeClass("d-none");
        }
    });

	//=================================================================================================================
    // Bind events
    

	//=================================================================================================================
	// Module methods


	//=================================================================================================================
	// This is what is exposed from this Module
	return {
	};

})(); // var spotify = (function(){
