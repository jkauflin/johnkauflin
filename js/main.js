/*==============================================================================
 * (C) Copyright 2015,2016,2017 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION: 
 *----------------------------------------------------------------------------
 * Modification History
 * 2015-03-06 JJK 	Initial version 
 * 2016-12-03 JJK	Converted from JQuery Mobile to Twitter Bootstrap
 * 2016-12-16 JJK	Working on getting the photo gallery right
 * 2017-03-25 JJK	Working on the menu and folder display to work with 
 * 					photos, audio, and video displays
 * 2017-04-01 JJK	No joke - I got the menus, thumbnails, and links working
 * 					with a function to handle all media types
 * 2017-04-02 JJK	Implementing webshims lib
 * 2017-04-03 JJK	Not implementing webshims lib until I need those polyfills
 * 					just using mediaelementjs for now
 * 2017-04-12 JJK	Giving up on webshims and mediaelementjs for now, just
 * 					using straight HTML5 audio object
 * 2017-04-15 JJK	Doing my own straight HTML5 audio playlist, but using the
 * 					webshims mediaelement
 * 2017-04-16 JJK	Got audio player and playlist in decent shape, working
 * 					on videos display
 * 2017-04-22 JJK	Videos display ok with default iframe for youtube
 * 					Adding headshot jumbo
 * 2017-05-07 JJK	Finishing up new Production version
 * 2017-10-08 JJK	Update to HTML5 boilerplate 6, bootstrap 3.3, jquery 3
 * 2018-10-07 JJK	Moving menus code to jjk-content-menus library
 * 2018-12-26 JJK	Update to HTML5 boilerplate 6.1
 * 2018-12-26 JJK   Re-factored for modules
 * 2020-12-12 JJK   Making updates for bootstrap 4
 *============================================================================*/
var main = (function () {
	'use strict';  // Force declaration of variables before use (among other things)
	//=================================================================================================================
	// Private variables for the Module
	var headshotRoot = "images/headshots";

	//=================================================================================================================
	// Variables cached from the DOM
	var $document = $(document);

	//=================================================================================================================
    // Bind events
    
    // Auto-close the collapse menu after clicking a non-dropdown menu item (in the bootstrap nav header)
    $(".navbar-nav li a:not('.dropdown-toggle')").on('click', function () { 
        $('.navbar-collapse').collapse('hide'); 
    });

    // Click on a link-tile will remove the active from the current tab, show the new tab and make it active
    $document.on("click", ".link-tile-tab", function (event) {
        var $this = $(this);
        event.preventDefault();
        var targetTab = $this.attr('data-dir');
        util.displayTabPage(targetTab);
    });

	//=================================================================================================================
	// Module methods


//                    <iframe src="emoncms/dashboard/view?id=3&apikey=38618b096c7f94b4bf7ce190af925037" 
// https://johnkauflin.com/home/emoncms/feed/value.json?id=4

        //$UpdateDisplay.empty();
        fetch('emoncms/feed/value.json?id=4').then(function (response) {
            console.log("response.text() = "+response.text());
            if (response.ok) {
                //return response.json();
                return response;
            } else {
                throw new Error('Error in response or JSON from server, code = '+response.status);
            }
        }).then(function (response) {
            console.log("feed response = "+response);
        })


	//<img src="images/johnk-headshot.jpg" class="img-circle pull-left" alt="John Kauflin photo" width="22%" display="inline" style="margin:0 10px 10px 0;" > 
	function createHeadshotDisplay() {
		$.getJSON("getDirList.php", "dir=" + headshotRoot + "&sort=1", function (dirList) {
			var htmlStr = '';
			var panelContent = '';
			var panelCollapseIn = "";

			$.each(dirList, function (index, dir) {
				//console.log("file = "+dir.filename);
				filePath = headshotRoot + '/' + dir.filename;

				// Check if it is an image file or a directory (if period found assume file, if not directory)
				periodPos = dir.filename.indexOf(".");
				if (periodPos >= 0) {
					//filename.length
					//filename.substring(periodPos,dir.filename.length)
					fileExt = dir.filename.substr(periodPos + 1).toUpperCase();

					// Process if the file is an image
					if (fileExt == "JPG" || fileExt == "JPEG" || fileExt == "GIF") {
						htmlStr += '<img src="' + filePath + '" class="img-rounded" alt="John Kauflin photo" width="130px" display="inline" style="margin:0 10px 10px 0;" >';
					}
				}
			});

			$('#HeadshotsDisplay').html(htmlStr);
		});

	} // 

	//=================================================================================================================
	// This is what is exposed from this Module
	return {
	};

})(); // var main = (function(){
