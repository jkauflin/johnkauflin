/*==============================================================================
 * (C) Copyright 2018 John J Kauflin, All rights reserved.
 *----------------------------------------------------------------------------
 * DESCRIPTION:
 * Gallery implementing blueimp - https://github.com/blueimp/Gallery
 *----------------------------------------------------------------------------
 * Modification History
 * 2016-03-12 JJK   Got bootstrap gallery version of blueimp working
    	Extra small devices Phones (<768px)
    	Small devices Tablets (≥768px)
    	Medium devices Desktops (≥992px)
    	Large devices Desktops (≥1200px)
 * 2017-10-08 JJK	Update to HTML5 boilerplate 6, bootstrap 3.3, jquery 3
 * 2018-10-04 JJK   Got newest photo gallery working and kept old docModal
 *                  display for PDF documents
 * 2018-11-23 JJK   Re-factored for modules
 * 2018-12-26 JJK   Brought from hoa web to personal one
 *                  *** work to make it even more abstracted and generic ***
 * 2019-01-12 JJK   Modified to add a title above the video iframe, and 
 *                  solved the order problem by updating the getDirList.php
 *============================================================================*/
var mgallery = (function(){
    'use strict';  // Force declaration of variables before use (among other things)
    //=================================================================================================================
    // Private variables for the Module
    //var photosRoot = "Photos";
    var photosRoot = "jjkPhotos";
    var photosThumbsRoot = photosRoot + "Thumbs";
    var photosSmallerRoot = photosRoot + "Smaller";
    var HDphotos = false;
    var selectedPhotosDir = photosRoot;

    var musicRoot = "jjkBands";
    var videosRoot = "jjkVideos";

    var plIndex = 0;
    var playlist;
    // Get the audio player object
    var audioPlayer = $('#AudioPlayer')[0];

    // Could this be moved to the main and call this module?

    // Build the initial photos menu from the root
    createMenu(photosRoot, "PhotosMenu", "photoFolderLink");
    displayThumbnails(photosRoot, "photoFolderLink", $("#PhotosBreadcrumbs"), $("#PhotosFolders"), $("#PhotosThumbnails"));
    // Respond to click on a photo menu or a folder in the thumbnails display
    $(document).on("click", ".photoFolderLink", function () {
        var $this = $(this);
        displayThumbnails($this.attr('data-dir'), "photoFolderLink", $("#PhotosBreadcrumbs"), $("#PhotosFolders"), $("#PhotosThumbnails"));
    });	

    // Build the initial menu from the root
    createMenu(videosRoot, "VideosMenu", "videoFolderLink");
    displayThumbnails(videosRoot, "videoFolderLink", $("#VideosBreadcrumbs"), $("#VideosFolders"), $("#VideosThumbnails"));
    // Respond to click on a menu or a folder in the thumbnails display
    $(document).on("click", ".videoFolderLink", function () {
        var $this = $(this);
        displayThumbnails($this.attr('data-dir'), "videoFolderLink", $("#VideosBreadcrumbs"), $("#VideosFolders"), $("#VideosThumbnails"));
    });

    // Build the initial music menu from the root
    createMenu(musicRoot, "MusicMenu", "musicFolderLink");
    displayThumbnails(musicRoot, "musicFolderLink", $("#MusicBreadcrumbs"), $("#MusicFolders"), $("#MusicThumbnails"));
    // Respond to click on a menu or a folder in the thumbnails display
    $(document).on("click", ".musicFolderLink", function () {
        var $this = $(this);
        displayThumbnails($this.attr('data-dir'), "musicFolderLink", $("#MusicBreadcrumbs"), $("#MusicFolders"), $("#MusicThumbnails"));
    });

    //=====================================================================================
    // Default the controls to borderless fullscreen
    //=====================================================================================
    $('#blueimp-gallery').data('useBootstrapModal', false);
    $('#blueimp-gallery').toggleClass('blueimp-gallery-controls', false);
    $('#blueimp-gallery').data('fullScreen', true);

    // Respond to changes in photo gallery configuration
    $('#borderless-checkbox').on('change', function () {
        var borderless = $(this).is(':checked')
        $('#blueimp-gallery').data('useBootstrapModal', !borderless)
        $('#blueimp-gallery').toggleClass('blueimp-gallery-controls', borderless)
    })
    $('#fullscreen-checkbox').on('change', function () {
        $('#blueimp-gallery').data('fullScreen', $(this).is(':checked'))
    })
    $('#hd-checkbox').on('change', function () {
        HDphotos = $(this).is(':checked');
        // keep a current selected photos dir (instead of just going to root)
        displayThumbnails(selectedPhotosDir);
    })

    document.getElementById('PhotosThumbnails').onclick = function (event) {
        event = event || window.event;
        var target = event.target || event.srcElement,
            link = target.src ? target.parentNode : target,
            options = { index: link, event: event },
            links = this.getElementsByTagName('a');
        blueimp.Gallery(links, options);
    };

    
    //=================================================================================================================
    // Variables cached from the DOM
    var $document = $(document);

    //=================================================================================================================
    // Bind events
    // General AJAX error handler to log the exception and set a message in DIV tags with a ajaxError class

    // Add event listeners to the audio player
    // When a song ends, see if there is a next one to play
    audioPlayer.addEventListener("ended", function () {
        nextSong();
    }, true);

    // Respond to clicking on songs in the playlist
    $(document).on("click", ".playlistSong", function () {
        var $this = $(this);
        loadSong($this.attr('data-plIndex'));
    });

    $(document).on("click", "#AudioNext", function () {
        nextSong();
    });
    $(document).on("click", "#AudioPrev", function () {
        prevSong();
    });

    //=================================================================================================================
    // Module methods

     // Create a collapsible menu from a directory structure
     function createMenu(dirName, panelGroupId, linkClass) {
        //Pass in sort (0 for alpha photos and 1 for years) ???
        $.getJSON("getDirList.php", "dir=" + dirName, function (dirList) {
            var htmlStr = '';
            var panelContent = '';
            var panelCollapseIn = "";

            $.each(dirList, function (index, dir) {
                // Skip any non-directory files at this level
                if (dir.filename.indexOf(".") >= 0) {
                    return true;
                }
                //console.log("createMenu, dirFileName = "+dirFileName);
                if (index == 0) {
                    panelCollapseIn = " in";
                } else {
                    panelCollapseIn = "";
                }

                htmlStr += '<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title">';
                htmlStr += '<a data-toggle="collapse" data-parent="#' + panelGroupId + '" href="#collapse' + (index+1) + panelGroupId + '">' + dir.filename + '</a>';
                htmlStr += '</h4></div>';
                htmlStr += '<div id="collapse' + (index+1) + panelGroupId + '" class="panel-collapse collapse' + panelCollapseIn + '"><div class="panel-body">';
                 //----------------------------------------------------------------------------------------------------------------------------------
                 panelContent = '<ul class="' + panelGroupId + 'List">'
                 $.each(dir.contents, function (index2, filename) {
                     // Skip any non-directory files at this level
                     //console.log("create menu, filename = "+filename);

                     if (filename.indexOf(".") >= 0) {
                         if (index2 == 0) {
                             panelContent += '<li><a data-dir="' + dirName + '/' + dir.filename + '" class="' + linkClass + '" href="#">' + dir.filename + '</a></li>';
                         }
                         return true;
                     }
                     
                     panelContent += '<li><a data-dir="' + dirName + '/' + dir.filename + '/' + filename + '" class="' + linkClass + '" href="#">' + filename + '</a></li>';

                 });
                 panelContent += '</ul>';
                 //----------------------------------------------------------------------------------------------------------------------------------
                 htmlStr += panelContent + '</div></div></div>';
             });

             $('#' + panelGroupId).html(htmlStr);
         });

     } // 

    // Display thumbnails and add photo links to gallery container
    // Create breadcrumbs, folder and entity links (for photos, audio, video, etc.)
    function displayThumbnails(dirName, linkClass, breadcrumbContainer, folderContainer, thumbnailContainer) {
        // if (photos)
        selectedPhotosDir = dirName;
        setBreadcrumbs(dirName, linkClass, breadcrumbContainer);
        folderContainer.empty();
        thumbnailContainer.empty();

        var subPath = "";
        var slashPos = dirName.indexOf("/");
        if (slashPos >= 0) {
            subPath = dirName.substr(slashPos);
        }
        var photosThumbDir = photosThumbsRoot + subPath;
        var photosSmallerDir = photosSmallerRoot + subPath;

        //console.log("dirName = "+dirName);
        $.getJSON("getDirList.php", "dir=" + dirName, function (dirList) {
            // loop through the list and display thumbnails in a div
            var periodPos = 0;
            var fileExt = '';
            var filePath = '';
            var audioFiles = false;

            //$.each(dirFileList, function (filename, subDirList) {
            $.each(dirList, function (index, dir) {
                //console.log("file = "+dir.filename);
                filePath = dirName + '/' + dir.filename;

                // Check if it is an image file or a directory (if period found assume file, if not directory)
                periodPos = dir.filename.indexOf(".");
                if (periodPos >= 0) {
                    fileExt = dir.filename.substr(periodPos + 1).toUpperCase();

                    // Process if the file is an image
                    if (fileExt == "JPG" || fileExt == "JPEG" || fileExt == "GIF") {
                        // If not a directory, add the photo to the gallery link list
                        // Just assume the thumbnail image will be there for now
                        if (!HDphotos) {
                            filePath = photosSmallerDir + '/' + dir.filename;
                        }

                        //console.log("photosThumbDir/filename = "+photosThumbDir+'/'+dir.filename);
                        $('<a/>')
                            .append($('<img>').prop('src', photosThumbDir + '/' + dir.filename).prop('class', "img-thumbnail"))
                            .prop('href', filePath)
                            .prop('title', dir.filename)
                            .appendTo(thumbnailContainer);
                    } else if (fileExt == "MP3") {
                        audioFiles = true;
                    } else if (dir.filename == "youtube.txt") {
                         // Get the list of youtube ids
                         var cPos = 0;
                         $.getJSON("getVideoList.php", "file=" + filePath, function (videoList) {
                             var videoIframe = '';
                             var videoId = '';
                             var videoName = '';
                             $.each(videoList, function (index, videoStr) {
                                 videoId = '';
                                 videoName = '';

                                 cPos = videoStr.indexOf(":");
                                 if (cPos >= 0) {
                                     videoName = videoStr.substr(0, cPos);
                                     videoId = util.cleanStr(videoStr.substr(cPos + 2));
                                 } else {
                                     videoId = util.cleanStr(videoStr);
                                 }

                                 if (videoId != '') {
                                    //console.log("videoName = "+videoName+", videoId = "+videoId);
                                    // Add a table with a title above the iframe
                                    $('<table style="float: left">')
                                        .append("<tr><td>"+videoName+"</td></tr>")
                                        .append($('<tr>').append($('<td>')
                                            .append($('<iframe>')
                                                .prop('src', "//www.youtube.com/embed/" + videoId)
                                                .attr('allowfullscreen', true)))
                                        ).appendTo(thumbnailContainer);
                                 }
                            });

                        });
                    }

                } else {
                    // If a directory, add the name with the folder icon
                    $('<button>')
                        .append($('<span>').prop('class', "glyphicon glyphicon-folder-open").html(' ' + dir.filename))
                        .prop('class', 'btn dirButton ' + linkClass)
                        .attr('data-dir', dirName + '/' + dir.filename)
                        .appendTo(folderContainer);
                }
                //.prop('style','margin-right: 10px; margin-bottom: 10px; border:1px solid;')
            });

            // if there were any MP3's, build a player with the playlist of MP3's
            if (audioFiles) {
                $.getJSON("getMP3Filelist.php", "dir=" + dirName, function (resultPlaylist) {
                    playlist = resultPlaylist;
                    loadPlaylist();
                });
            }

        });

        // no don't adjust the side menu for now
        //displayPhotoMenu(dirName);

    } // function displayThumbnails(dirName,breadcrumbContainerName,folderContainerName,thumbnailContainerName) {


     // linkClass
     function setBreadcrumbs(dirName, linkClass, breadcrumbContainer) {
         breadcrumbContainer.empty();

         var dirArray = dirName.split("/");
         //console.log('setBreadcrumbs dirName = '+dirName);
         var urlStr = '';
         $.each(dirArray, function (index, dirName) {
             if (index == dirArray.length - 1) {
                 $('<li>')
                     .prop('class', 'active')
                     .html(dirName)
                     .appendTo(breadcrumbContainer);
             } else {
                 if (index == 0) {
                     urlStr += dirName;
                 } else {
                     urlStr += '/' + dirName;
                 }
                 $('<li>')
                     .append($('<a>').prop('href', '#').html(dirName).prop('class', linkClass).attr('data-dir', urlStr))
                     .appendTo(breadcrumbContainer);
             }
         });
     }


     // Audio =============================================================================================================================
    function loadSong(index) {
        plIndex = index;

        $("#AudioPlayer").attr("src", playlist[plIndex].url);
        audioPlayer.pause();
        audioPlayer.load();//suspends and restores all audio element
        //console.log("loaded audio, plIndex = "+plIndex);
        audioPlayer.oncanplaythrough = audioPlayer.play();

        var year = '';
        if (playlist[plIndex].year != '') {
            year = '(' + playlist[plIndex].year + ') ';
        }

        $('#currentArtistAlbum').html(playlist[plIndex].artist + " - " + year + playlist[plIndex].album);
        //$('#currentAlbum').html("Album: "+playlist[plIndex].album);
        var plNum = '' + (parseInt(plIndex) + 1);
        $('#currentTitle').html(plNum + ' - ' + playlist[plIndex].title);
        //audioPlayer.currentTime = 10.0;
    } // function loadSong(index) {

    function nextSong() {
        if (playlist != null) {
            if (plIndex < playlist.length - 1) {
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
        $.each(playlist, function (index, song) {
            //console.log("song.title = "+song.title);
            if (index == 0) {
				/*
				$('<tr>')
				.append($('<th>').html('Row'))
				.append($('<th>').html('Sale Date'))
				.appendTo(playlistDisplay);
				*/
            }

            tr = $('<tr>').attr('class', "smalltext");
            tr.append($('<td>').html(index + 1));
            tr.append($('<td>').append($('<a>')
                .attr('href', "#")
                .attr('class', "playlistSong")
                .attr('data-plIndex', index)
                .html(song.title)));

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

     
    //=================================================================================================================
    // This is what is exposed from this Module
    return {
    };
        
})(); // var mgallery = (function(){
