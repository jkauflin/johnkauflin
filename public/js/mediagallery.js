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
 * 2020-02-20 JJK   Trying to make it more of a self-contained, configurable
 *                  library.  Starting with a configuration array.
 * 2020-02-22 JJK   Got it working with folders under a parent directory
 *                  (looking for the 2nd slash)
 *============================================================================*/
var mgallery = (function(){
    'use strict';  // Force declaration of variables before use (among other things)
    //=================================================================================================================
    // Private variables for the Module
    //var photosRoot = "Photos";
    //var photosRoot = "jjkPhotos";
    //var photosRoot = "Data/jjkPhotos";
    //var photosThumbsRoot = photosRoot + "Thumbs";
    //var photosSmallerRoot = photosRoot + "Smaller";

    var musicRoot = "jjkBands";
    var videosRoot = "jjkVideos";
    var docsRoot = "Docs";

    var config = [
        {
            "name": "Photos",
            "rootDir": "Media/Photos",
            "menuDiv": "PhotosMenu",
            "breadcrumbsDiv": "PhotosBreadcrumbs",
            "foldersDiv": "PhotosFolders",
            "thumbnailsDiv": "PhotosThumbnails",
            "folderLinkClass": "MediaFolderLink"
        },
        {
            "name": "Music",
            "rootDir": "Media/Music",
            "menuDiv": "MusicMenu",
            "breadcrumbsDiv": "MusicBreadcrumbs",
            "foldersDiv": "MusicFolders",
            "thumbnailsDiv": "MusicThumbnails",
            "folderLinkClass": "MediaFolderLink"
        },
        {
            "name": "Videos",
            "rootDir": "Media/Videos",
            "menuDiv": "VideosMenu",
            "breadcrumbsDiv": "VideosBreadcrumbs",
            "foldersDiv": "VideosFolders",
            "thumbnailsDiv": "VideosThumbnails",
            "folderLinkClass": "MediaFolderLink"
        }
    ];

/*
addPerson: function(value) {
    this.people.push(value || this.$input.val());
    var name = (typeof value === "string") ? value : $input.val();
*/

    var plIndex = 0;
    var playlist;
    // Get the audio player object
    var audioPlayer = $('#AudioPlayer')[0];


    // Build the initial photos menu from the root
    var i = 0;
    // *** problem i is not scoped in the loop - so it just gets the last one 
    for (i in config) {
        console.log(">>> config[i].menuDiv = " + config[i].menuDiv+", config[i].folderLinkClass = "+config[i].folderLinkClass);
        createMenu(config[i].rootDir, config[i].menuDiv, config[i].folderLinkClass);
        displayThumbnails(config[i].rootDir, config[i].folderLinkClass, 
            $("#" + config[i].breadcrumbsDiv), $("#" + config[i].foldersDiv), $("#" + config[i].thumbnailsDiv));

    }

    // respond to a common link, check what it is and find it in the array, and use those values
    // Respond to click on a photo menu or a folder in the thumbnails display
    $(document).on("click", "." + config[i].folderLinkClass, function () {
        var $this = $(this);
        console.log("Click on .MediaFolderLink, data-dir = " + $this.attr('data-dir'));
        //displayThumbnails($this.attr('data-dir'), "MediaFolderLink",
        //    $("#" + config[i].breadcrumbsDiv), $("#" + config[i].foldersDiv), $("#" + config[i].thumbnailsDiv));
    });	
    

    /*
    createMenu(docsRoot, "DocsMenu", "docFolderLink");
    displayThumbnails(docsRoot, "docFolderLink", $("#DocsBreadcrumbs"), $("#DocsFolders"), $("#DocsThumbnails"));
    // Respond to click on a menu or a folder in the thumbnails display
    $(document).on("click", ".docFolderLink", function () {
        var $this = $(this);
        displayThumbnails($this.attr('data-dir'), "docFolderLink", $("#DocsBreadcrumbs"), $("#DocsFolders"), $("#DocsThumbnails"));
    });

    // Build the initial music menu from the root
    createMenu(musicRoot, "MusicMenu", "musicFolderLink");
    displayThumbnails(musicRoot, "musicFolderLink", $("#MusicBreadcrumbs"), $("#MusicFolders"), $("#MusicThumbnails"));
    // Respond to click on a menu or a folder in the thumbnails display
    $(document).on("click", ".musicFolderLink", function () {
        var $this = $(this);
        displayThumbnails($this.attr('data-dir'), "musicFolderLink", $("#MusicBreadcrumbs"), $("#MusicFolders"), $("#MusicThumbnails"));
    });
    */

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

    //=================================================================================================================
    // Bind events

    // If there is a data-dir parameters, build and display the Photo page
    //var dataDir = decodeURIComponent(util.urlParam('data-dir'));
    // *** if coming in with a qualified link - look for the data-dir and display that one
    //     ELSE just display the default Photos root
    /*
    var dataDir = util.urlParam('data-dir');
    //console.log("dataDir = " + dataDir);
    if (dataDir != null) {
        var $this = $(this);
        displayThumbnails(decodeURIComponent(dataDir), "photoFolderLink", $("#PhotosBreadcrumbs"), $("#PhotosFolders"), $("#PhotosThumbnails"));

        var $document = $(document);
        var $displayPage = $document.find('#navbar a[href="#PhotosPage"]');

        $displayPage.tab('show');
    } else {
        displayThumbnails(photosRoot, "photoFolderLink", $("#PhotosBreadcrumbs"), $("#PhotosFolders"), $("#PhotosThumbnails"));
    }
    */

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
         //console.log("createMenu, dir=" + dirName);
         $.getJSON("getDirList.php", "dir=" + dirName, function (dirList) {
            var htmlStr = '';
            var panelContent = '';
            var panelCollapseIn = "";

            $.each(dirList, function (index, dir) {
                // Skip any non-directory files at this level
                if (dir.filename.indexOf(".") >= 0) {
                    return true;
                }
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
        setBreadcrumbs(dirName, linkClass, breadcrumbContainer);
        folderContainer.empty();
        thumbnailContainer.empty();

        // Assuming the media folder are under a parent media folder (look for 2nd slash to get sub-path)
        var firstSlashPos = dirName.indexOf("/");
        var secondSlashPos = dirName.indexOf("/",firstSlashPos+1);
        var rootDir = dirName;
        if (secondSlashPos >= 0) {
            rootDir = dirName.substr(0,secondSlashPos);
        }

        // Assume the subpath starts at the 2nd slash
        var subPath = "";
        if (secondSlashPos >= 0) {
            subPath = dirName.substr(secondSlashPos)
        }

        //console.log("rootDir = "+rootDir+", subPath = "+subPath);

        var photosThumbsRoot = rootDir + "Thumbs";
        var photosSmallerRoot = rootDir + "Smaller";
        var photosThumbDir = photosThumbsRoot + subPath;
        var photosSmallerDir = photosSmallerRoot + subPath;

        //console.log("getDirList dirName = " + dirName);
        $.getJSON("getDirList.php", "dir=" + dirName, function (dirList) {
            // loop through the list and display thumbnails in a div
            var periodPos = 0;
            var fileExt = '';
            var filePath = '';
            var audioFiles = false;

            //$.each(dirFileList, function (filename, subDirList) {
            $.each(dirList, function (index, dir) {
                filePath = dirName + '/' + dir.filename;
                //console.log("file = " + dir.filename + ", filePath = " + filePath);

                // Check if it is an image file or a directory (if period found assume file, if not directory)
                periodPos = dir.filename.indexOf(".");
                if (periodPos >= 0) {
                    fileExt = dir.filename.substr(periodPos + 1).toUpperCase();

                    // Process if the file is an image
                    if (fileExt == "JPG" || fileExt == "JPEG" || fileExt == "GIF") {
                        // If not a directory, add the photo to the gallery link list
                        // Just assume the thumbnail image will be there for now
                        
                        filePath = photosSmallerDir + '/' + dir.filename;
                        //console.log("photosThumbDir/filename = "+photosThumbDir+'/'+dir.filename);
                        
                        $('<a/>')
                            .append($('<img>').prop('src', photosThumbDir + '/' + dir.filename).prop('class', "img-thumbnail"))
                            .prop('href', filePath)
                            .prop('title', dir.filename)
                            .appendTo(thumbnailContainer);
                    } else if (fileExt == "MP3") {
                        audioFiles = true;
                    } else if (fileExt == "PDF") {

                        $('<a/>')
                            .append(dir.filename)
                            .prop('href', filePath)
                            .prop('title', dir.filename)
                            .appendTo(thumbnailContainer);

                    } else if (dir.filename == "youtube.txt") {

                    }

                } else {
                    // If a directory, add the name with the folder icon
                    //console.log("Folder container, dir.filename = " + dir.filename);
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
         $.each(dirArray, function (index, dirName2) {
             if (index == dirArray.length - 1) {
                 $('<li>')
                     .prop('class', 'active')
                     .html(dirName2)
                     .appendTo(breadcrumbContainer);
             } else {
                 if (index == 0) {
                     urlStr += dirName2;
                 } else {
                     urlStr += '/' + dirName2;
                 }
                 $('<li>')
                     .append($('<a>').prop('href', '#').html(dirName2).prop('class', linkClass).attr('data-dir', urlStr))
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
