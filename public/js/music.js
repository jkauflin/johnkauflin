/*==============================================================================
 * (C) Copyright 2017 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION: 
 *----------------------------------------------------------------------------
 * Modification History
 * 2017-05-07 JJK 	Initial version (copy from main page) 
 * 2017-06-24 JJK	Put browse on Home and player on Music page
 * 					Got album and song play and adds working
 * 2019 - *** OBSOLETE ***
 *============================================================================*/

// Global variables
var musicRoot = "jjkMusic";
var audioPlayer;
var plIndex = 0;
var playlist;
var addlist;

function waitCursor() {
    $('*').css('cursor', 'progress');
    $(".ajaxError").html("");
}

$(document).ajaxError(function(e, xhr, settings, exception) {
	console.log("ajax exception = "+exception);
	console.log("ajax exception xhr.responseText = "+xhr.responseText);
    $(".ajaxError").html("An Error has occurred (see console log)");
});


$(document).ready(function(){
	//$("#DisplayWidth").text("width = "+$(window).width());

	// 2017-04-03 JJK - Implement this when needed for polyfills
	// load and implement all unsupported features 
	//webshims.polyfill();
	webshim.polyfill('mediaelement');

	// Auto-close the collapse menu after clicking a non-dropdown menu item (in the bootstrap nav header)
	$(document).on('click','.navbar-collapse.in',function(e) {
	    if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
	        $(this).collapse('hide');
	    }
	});
	
	// Get the audio player object
	audioPlayer = $('#AudioPlayer')[0];

	/*
    music.html#:1 Uncaught (in promise) DOMException: The play() request was interrupted by a call to pause().
    webshim.mediaelement.loadDebugger();
    
    https://www.sitepoint.com/essential-audio-and-video-events-for-html5/
    https://www.w3.org/2010/05/video/mediaevents.html
	*/

	// Add event listeners to the audio player
	audioPlayer.addEventListener("error", function failed(e) { 
		//console.log("e.target.error.code = "+e.target.error.code);
		/*
		if (MediaError.message !== undefined) {
			$("#mediaError").html("MediaError = "+MediaError.message);
		}
		*/
	}, true);

/*
1 = MEDIA_ERR_ABORTED - fetching process aborted by user
2 = MEDIA_ERR_NETWORK - error occurred when downloading
3 = MEDIA_ERR_DECODE - error occurred when decoding
4 = MEDIA_ERR_SRC_NOT_SUPPORTED - audio/video not supported

Found 5 errors/warnings with at least 1 critical issue.
mediaelement-debug.js:1 URL has invalid characters. Remove any special characters and mutated vowels. priority level: 1 urlInValid
mediaelement-debug.js:1 Content of media file is encoded with gzip/defalte. Make sure to not encode it. It's already encoded. priority level: 1 doubleEncoded
mediaelement-debug.js:1 Content-Type header for media file is either empty or application/octet-stream. priority level: 2.5 noContentType
mediaelement-debug.js:1 Content-Length header for media file does not send value. priority level: 3 noContentLength
mediaelement-debug.js:1 Accept-Ranges header for media file does not send value. Make sure server supports Range requests in bytes priority level: 3 noRange

$('audio').addEventListener('error', function failed(e) {
   // audio playback failed - show a message saying why
   // to get the source of the audio element use $(this).src
   switch (e.target.error.code) {
     case e.target.error.MEDIA_ERR_ABORTED:
       alert('You aborted the video playback.');
       break;
     case e.target.error.MEDIA_ERR_NETWORK:
       alert('A network error caused the audio download to fail.');
       break;
     case e.target.error.MEDIA_ERR_DECODE:
       alert('The audio playback was aborted due to a corruption problem or because the video used features your browser did not support.');
       break;
     case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
       alert('The video audio not be loaded, either because the server or network failed or because the format is not supported.');
       break;
     default:
       alert('An unknown error occurred.');
       break;
   }
 }, true);
*/

	// When a song ends, see if there is a next one to play
	audioPlayer.addEventListener("ended", function() { 
		nextSong();
	}, true);

	// Respond to clicking on songs in the playlist
    $(document).on("click",".playlistSong",function(){
    	var $this = $(this);
    	loadSong($this.attr('data-plIndex'));
	});	

    $(document).on("click","#AudioNext",function(){
		nextSong();
	});
    $(document).on("click","#AudioPrev",function(){
		prevSong();
	});

	// Build the initial music menu from the root
    createMenu(musicRoot,"MusicMenu","musicFolderLink");
	displayThumbnails(musicRoot,"musicFolderLink",$("#MusicBreadcrumbs"),$("#MusicFolders"),$("#MusicThumbnails"));
    // Respond to click on a menu or a folder in the thumbnails display
    $(document).on("click",".musicFolderLink",function(){
    	var $this = $(this);
    	displayThumbnails($this.attr('data-dir'),"musicFolderLink",$("#MusicBreadcrumbs"),$("#MusicFolders"),$("#MusicThumbnails"));
	});
    

    $(document).on("click",".addMusic",function(){
    	var $this = $(this);
    	var filename = '';
    	if ($this.attr("data-filename") !== undefined) {
    		filename = $this.attr("data-filename");
    	}

		// debugging
    	//console.log("addMusic, dir = "+$this.attr("data-dir")+", filename = "+filename);
    	//$("#tempConsole").html("addMusic, dir = "+$this.attr("data-dir")+", filename = "+filename);

		$.getJSON("getMP3Filelist.php","dir="+$this.attr("data-dir")+"&filename="+filename,function(resultPlaylist){
			if (playlist === undefined) {
				playlist = resultPlaylist;
				loadPlaylist();
			} else {
				addlist = resultPlaylist;
				addPlaylist();
			}
		});
    	
	});

    
    $(document).on("click",".playMusic",function(){
    	var $this = $(this);
    	var filename = '';
    	if ($this.attr("data-filename") !== undefined) {
    		filename = $this.attr("data-filename");
    	}

		// debugging
    	//console.log("playMusic, dir = "+$this.attr("data-dir")+", filename = "+filename);
    	//$("#tempConsole").html("playMusic, dir = "+$this.attr("data-dir")+", filename = "+filename);

		$.getJSON("getMP3Filelist.php","dir="+$this.attr("data-dir")+"&filename="+filename,function(resultPlaylist){
			playlist = resultPlaylist;
			loadPlaylist();
		});

		// Jump to the player tab
		$('#navbar a[href="#MusicPage"]').tab('show');
	});

      
}); // $(document).ready(function(){


// Create a collapsible menu from a directory structure
function createMenu(dirName,panelGroupId,linkClass) {
	$.getJSON("getDirFileList.php","dir="+dirName,function(dirFileList){
		var htmlStr = '';
		var panelContent = '';
		var cnt = 0;
		var imageCnt = 0;
		var panelCollapseIn = "";
		
		$.each(dirFileList, function( dirFileName, subDirList ) {
			// Skip any non-directory files at this level
			if (dirFileName.indexOf(".") >= 0) {
				return true;
			}
			cnt += 1;
			if (cnt == 1) {
				//???
				panelCollapseIn = " in";
			} else {
				panelCollapseIn = "";
			}

			htmlStr += '<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">';
			htmlStr += '<a data-toggle="collapse" data-parent="#'+panelGroupId+'" href="#collapse'+cnt+panelGroupId+'">'+dirFileName+'</a>';
			htmlStr += '</h4></div>';
			htmlStr += '<div id="collapse'+cnt+panelGroupId+'" class="panel-collapse collapse'+panelCollapseIn+'"><div class="panel-body">';
			//----------------------------------------------------------------------------------------------------------------------------------
			panelContent = '<ul class="'+panelGroupId+'List">'
			imageCnt = 0;
			$.each(subDirList, function( index, filename ) {
				// Skip any non-directory files at this level
				//console.log("create menu, filename = "+filename);
				
				if (filename.indexOf(".") >= 0) {
					imageCnt += 1;
					if (imageCnt == 1) {
						//panelContent += '<li data-dir="'+dirName+'/'+dirFileName+'"><a href="#">'+dirFileName+'</a></li>';
						panelContent += '<li><a data-dir="'+dirName+'/'+dirFileName+'" class="'+linkClass+'" href="#">'+dirFileName+'</a></li>';
					}
					return true;
				}
				//panelContent += '<li data-dir="'+dirName+'/'+dirFileName+'/'+filename+'"><a href="#">'+filename+'</a></li>';
				panelContent += '<li><a data-dir="'+dirName+'/'+dirFileName+'/'+filename+'" class="'+linkClass+'" href="#">'+filename+'</a></li>';
			});
			panelContent += '</ul>';
			//----------------------------------------------------------------------------------------------------------------------------------
			htmlStr += panelContent + '</div></div></div>';
		});

	    $('#'+panelGroupId).html(htmlStr);
	});
	
} // 

// Display thumbnails and add photo links to gallery container
// Create breadcrumbs, folder and entity links (for photos, audio, video, etc.)
function displayThumbnails(dirName,linkClass,breadcrumbContainer,folderContainer,thumbnailContainer) {
	// if (photos)
	selectedPhotosDir = dirName;

	setBreadcrumbs(dirName,linkClass,breadcrumbContainer);

	folderContainer.empty();
	thumbnailContainer.empty();
	
	var subPath = "";
	var slashPos = dirName.indexOf("/");
	if (slashPos >= 0) {
		subPath = dirName.substr(slashPos);
	}
	
	//console.log("dirName = "+dirName);
	$.getJSON("getDirFileList.php","dir="+dirName,function(dirFileList){
		// loop through the list and display thumbnails in a div
		var cnt = -1;
		var periodPos = 0;
		var fileExt = '';
		var filePath = '';
		var filePartArray;
		var audioFiles = false;
		
		//console.log("dirFileList = "+dirFileList);
		
		var songlistDisplay = $("#SonglistDisplay tbody");
		songlistDisplay.empty();
		var tr;

		$.each(dirFileList, function( filename, subDirList ) {
			cnt += 1;
			//console.log("file = "+filename);
			filePath = dirName+'/'+filename;

			// Check if it is an image file or a directory (if period found assume file, if not directory)
			periodPos = filename.indexOf(".");
			if (periodPos >= 0) {
				filePartArray = filename.split(".");
				fileExt = filePartArray[filePartArray.length-1].toUpperCase();
				
				// Process if the file is an image
				if (fileExt == "MP3") {
					audioFiles = true;
					tr = $('<tr>').attr('class',"");
					tr.append($('<td>')
					        .append($('<a/>').prop('class',"glyphicon glyphicon-plus addMusic")
					        	.prop('href', '#')
					        	.attr('data-dir', dirName)
				        		.attr('data-filename', filename))
							.append($('<a>')
								.prop('href',"#")
								.prop('class',"playMusic smalltext")
								.attr('data-dir', dirName)
				        		.attr('data-filename', filename)
								.html(filename)) );
					tr.appendTo(songlistDisplay);		
				} else if (fileExt == "M3U") {
					//var dirArray = dirName.split("/");
					//var albumName = dirArray[dirArray.length-1];
					
					$('<button>')
					.append($('<a/>').prop('class',"glyphicon glyphicon-play playMusic")
							.prop('href', '#')
							.attr('data-dir', dirName)
				        	.attr('data-filename', filename)
							.html(' '+filename))
					.prop('class','btn dirButton')
					.attr('data-dir', dirName)
					.append($('<a/>').prop('class',"glyphicon glyphicon-plus addMusic")
							.prop('href', '#')
				        	.attr('data-filename', filename)
							.attr('data-dir', dirName))
					.appendTo(folderContainer);
				}

			} else {
				// If a directory, add the name with the folder icon
				$('<button>')
		        .append($('<span>').prop('class',"glyphicon glyphicon-folder-open").html(' '+filename))
		        .prop('class','btn dirButton '+linkClass)
		        .attr('data-dir', dirName+'/'+filename)
		        .appendTo(folderContainer);
			}
	        //.prop('style','margin-right: 10px; margin-bottom: 10px; border:1px solid;')
		});
		
		// if there were any MP3's, build a player with the playlist of MP3's
		if (audioFiles) {
			var dirArray = dirName.split("/");
			var albumName = dirArray[dirArray.length-1];
			
			$('<button>')
		    .append($('<a/>').prop('class',"glyphicon glyphicon-play playMusic")
	        		.prop('href', '#')
	        		.attr('data-dir', dirName)
	        		.html(' '+albumName))
	        .prop('class','btn dirButton')
	        .attr('data-dir', dirName)
	        .append($('<a/>').prop('class',"glyphicon glyphicon-plus addMusic")
	        		.prop('href', '#')
	        		.attr('data-dir', dirName))
	        .appendTo(folderContainer);
		}
		
	});

	// no don't adjust the side menu for now
	//displayPhotoMenu(dirName);

} // function displayThumbnails(dirName,breadcrumbContainerName,folderContainerName,thumbnailContainerName) {


// linkClass
function setBreadcrumbs(dirName,linkClass,breadcrumbContainer) {
	breadcrumbContainer.empty();

	var dirArray = dirName.split("/");	
	//console.log('setBreadcrumbs dirName = '+dirName);
	var urlStr = '';
	$.each(dirArray, function(index, dirName) {
		if (index == dirArray.length-1) {
			$('<li>')
			.prop('class','active')
			.html(dirName)
			.appendTo(breadcrumbContainer);
		} else {
			if (index == 0) {
				urlStr += dirName;
			} else {
				urlStr += '/' + dirName;
			}
			$('<li>')
			.append($('<a>').prop('href','#').html(dirName).prop('class',linkClass).attr('data-dir',urlStr))
			.appendTo(breadcrumbContainer);
		}
	});
} 


function loadSong(index) {
	plIndex = index;

	if (playlist != null) {
		if (playlist.length > 0) {
			var year = '';
			if (playlist[plIndex].year != '') {
				year = '(' + playlist[plIndex].year + ') ';
			}
			
			$('#currentArtistAlbum').html(playlist[plIndex].artist+" - "+year+playlist[plIndex].album);
			//$('#currentAlbum').html("Album: "+playlist[plIndex].album);
			var plNum = ''+(parseInt(plIndex)+1);
			$('#currentTitle').html(plNum+' - '+playlist[plIndex].title);

			//console.log("playlist[plIndex].url = "+playlist[plIndex].url);

			$("#AudioPlayer").attr("src",playlist[plIndex].url);
			//audioPlayer.pause();
			audioPlayer.load();//suspends and restores all audio element
			//console.log("loaded audio, plIndex = "+plIndex);

			audioPlayer.oncanplaythrough = audioPlayer.play();
			//music.html#:1 Uncaught (in promise) DOMException: The play() request was interrupted by a call to pause().

			//audioPlayer.currentTime = 10.0;
		}
	}
		
} // function loadSong(index) {

function nextSong() {
	if (playlist != null) {
		if (plIndex < playlist.length-1) {
			loadSong(++plIndex);
		}
	}
}
function prevSong() {
	if (plIndex > 0) {
		loadSong(--plIndex);
	}
}

function loadPlaylist() {
	//console.log("loadPlaylist, playlist.length = "+playlist.length+", title = "+playlist[0].title);
	$('#PlayListContainer').removeClass('hidden');
	
	// Load the first song in the playlist
	loadSong(0);
	
	var playlistDisplay = $("#PlaylistDisplay tbody");
	playlistDisplay.empty();
	
	var tr;
	$.each(playlist, function(index,song) {
		//console.log("song.title = "+song.title);
		if (index == 0) {
			/*
			$('<tr>')
			.append($('<th>').html('Row'))
			.append($('<th>').html('Sale Date'))
			.appendTo(playlistDisplay);
			*/		
		}
		
		tr = $('<tr>').attr('class',"smalltext");
		tr.append($('<td>').html(index+1));
		tr.append($('<td>').append($('<a>')
								.attr('href',"#")
								.attr('class',"playlistSong")
								.attr('data-plIndex',index)
								.html(song.title)) );

		tr.append($('<td>').html(song.playtime));
		/*
								.prop('style','margin-right:7px;')
		song.url;
		song.artist;
		song.album;
		song.genre;
		song.title;
		song.track;
		song.year;
		song.comment;
		song.original_artist;
		song.bitrate;
		song.playtime;
		song.coverArt;
		 */

		tr.appendTo(playlistDisplay);		
	});
	
	//$('#navbar a[href="#PlayerPage"]').tab('show');

} // function loadPlaylist() {

function addPlaylist() {
	//console.log("loadPlaylist, playlist.length = "+playlist.length+", title = "+playlist[0].title);
	//$('#PlayListContainer').removeClass('hidden');
	
	var playlistDisplay = $("#PlaylistDisplay tbody");
	//playlistDisplay.empty();
	
	var cnt = playlist.length;
	var tr;
	$.each(addlist, function(index,song) {
		playlist.push(song);
		
		tr = $('<tr>').attr('class',"smalltext");
		cnt = cnt + 1;
		
		//console.log("Add cnt = "+cnt+", length = "+playlist.length+", name = "+song.title);
		
		tr.append($('<td>').html(cnt));
		tr.append($('<td>').append($('<a>')
								.attr('href',"#")
								.attr('class',"playlistSong")
								.attr('data-plIndex',cnt-1)
								.html(song.title)) );

		tr.append($('<td>').html(song.playtime));
		/*
								.prop('style','margin-right:7px;')
		song.url;
		song.artist;
		song.album;
		song.genre;
		song.title;
		song.track;
		song.year;
		song.comment;
		song.original_artist;
		song.bitrate;
		song.playtime;
		song.coverArt;
		 */

		tr.appendTo(playlistDisplay);		
	});
	
	//$('#navbar a[href="#PlayerPage"]').tab('show');

} // 
