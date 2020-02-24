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
 * 2020-02-23 JJK   Re-working as a single collection of folders under the
 *                  parent Media directory
 *============================================================================*/
var mgallery = (function(){
    'use strict';  // Force declaration of variables before use (among other things)

    //=================================================================================================================
    // Private variables for the Module
    var plIndex = 0;
    var playlist = [];

    // Create an HTML5 audio element in the DOM
    var audioPlayer = document.createElement('audio');
    audioPlayer.setAttribute('controls', true);
    audioPlayer.setAttribute('id', 'AudioPlayer');

    audioPlayer.style.border = '0';
    audioPlayer.style.outline = '0'
    audioPlayer.style.padding = '0 0 6px 0';

    /*
    var elem = document.querySelector('#some-element');

    // Set color to purple
    elem.style.color = 'purple';

    // Set the background color to a light gray
    elem.style.backgroundColor = '#e5e5e5';

    // Set the height to 150px
    elem.style.height = '150px';


    audio { border: none; padding: 0 0 6px 0; }

.addMusic { margin:0 10px 0 10px;}
#PlayListContainer { padding: 0 10px 0 10px; margin: 5px 0 0 0; }
tr.smalltext { font - size: 1em; }
.audioControlIcon { font - size: 1.8em; margin: 8px 5px 5px 0; }
*/

    // Get the audio player object
    //var audioPlayer = $('#AudioPlayer')[0];

    //=================================================================================================================
    // Variables cached from the DOM
    var $document = $(document);
    var $menuHeader = $document.find("#MediaHeader");
    var $menuContainer = $document.find("#MediaMenu");
    var $breadcrumbContainer = $document.find("#MediaBreadcrumbs");
    var $folderContainer = $document.find("#MediaFolders");
    var $thumbnailContainer = $document.find("#MediaThumbnails");
    var $blueimpGallery = $document.find("#blueimp-gallery");
    var $audioPlayer = $document.find("#AudioPlayer");
    //var audioPlayer = $('#AudioPlayer')[0];


    //=================================================================================================================
    // Bind events

    // Respond to click on a media folder by dynamically building the thumbnail display
    $document.on("click", ".MediaFolderLink", function () {
        var $this = $(this);
        //console.log("Click on .MediaFolderLink, data-dir = " + $this.attr('data-dir'));
        displayThumbnails($this.attr('data-dir'));
    });	

    // Respond to click on a bootstrap navigation tab
    $document.on('shown.bs.tab', 'a[data-toggle="tab"]', function () {
        var $this = $(this);
        displayThumbnails($this.attr('data-dir'));
    });	

    document.getElementById('MediaThumbnails').onclick = function (event) {
        event = event || window.event;
        var target = event.target || event.srcElement,
            link = target.src ? target.parentNode : target,
            options = { index: link, event: event },
            links = this.getElementsByTagName('a');
        blueimp.Gallery(links, options);
    };

    //=====================================================================================
    // Default the controls to borderless fullscreen
    //=====================================================================================
    $blueimpGallery.data('useBootstrapModal', false);
    $blueimpGallery.toggleClass('blueimp-gallery-controls', false);
    $blueimpGallery.data('fullScreen', true);

    // Respond to changes in photo gallery configuration
    $('#borderless-checkbox').on('change', function () {
        var borderless = $(this).is(':checked')
        $('#blueimp-gallery').data('useBootstrapModal', !borderless)
        $('#blueimp-gallery').toggleClass('blueimp-gallery-controls', borderless)
    })
    $('#fullscreen-checkbox').on('change', function () {
        $('#blueimp-gallery').data('fullScreen', $(this).is(':checked'))
    })


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
     function createMenu(dirName, panelGroupId) {
         //console.log("createMenu, dir=" + dirName + ", panelGroupId = " + panelGroupId);
         $menuHeader.text(panelGroupId);

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
                             panelContent += '<li><a data-dir="' + dirName + '/' + dir.filename + '" class="MediaFolderLink" href="#">' + dir.filename + '</a></li>';
                         }
                         return true;
                     }
                     
                     panelContent += '<li><a data-dir="' + dirName + '/' + dir.filename + '/' + filename + '" class="MediaFolderLink" href="#">' + filename + '</a></li>';

                 });
                 panelContent += '</ul>';
                 //----------------------------------------------------------------------------------------------------------------------------------
                 htmlStr += panelContent + '</div></div></div>';
             });

             $menuContainer.html(htmlStr);
         });

     } // 

    // Create breadcrumbs, folder and entity links (for photos, audio, video, etc.)
    function displayThumbnails(dirName) {
        setBreadcrumbs(dirName);
        $folderContainer.empty();
        $thumbnailContainer.empty();

        // Assuming the media folder are under a parent media folder (look for 2nd slash to get sub-path)
        var firstSlashPos = dirName.indexOf("/");
        var secondSlashPos = dirName.indexOf("/",firstSlashPos+1);
        var rootDir = dirName;
        var categoryName = "";
        if (secondSlashPos >= 0) {
            rootDir = dirName.substr(0,secondSlashPos);
        } else {
            // If no 2nd slash, assume top level of a type and build the menu for that type
            categoryName = dirName.substr(firstSlashPos + 1);
            createMenu(dirName, categoryName);
        }

        // Assume a parent media dir and that the 2nd segment is the "name" to use for the DIV's

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
            var fileNameNoExt = '';

            var audioFiles = false;
            playlist.length = 0;
            plIndex = -1;
            var $playlistTbody = $('<tbody>');
            var tr;

            //$.each(dirFileList, function (filename, subDirList) {
            $.each(dirList, function (index, dir) {
                filePath = dirName + '/' + dir.filename;
                //console.log("file = " + dir.filename + ", filePath = " + filePath);

                // Check if it is an image file or a directory (if period found assume file, if not directory)
                periodPos = dir.filename.indexOf(".");
                if (periodPos >= 0) {
                    fileExt = dir.filename.substr(periodPos + 1).toUpperCase();
                    fileNameNoExt = dir.filename.substr(0,periodPos);

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
                            .appendTo($thumbnailContainer);

                    } else if (fileExt == "MP3") {
                        //console.log("fileNameNoExt = " + fileNameNoExt+", url = "+filePath);
                        audioFiles = true;
                        plIndex++;
                        playlist.push({ "title": fileNameNoExt, "url": filePath });

                        // add the table rows for the playlist
                        // build a table then append to the thumbnail container

                        tr = $('<tr>').attr('class', "smalltext");
                        tr.append($('<td>').append($('<a>')
                            .attr('href', "#")
                            .attr('class', "playlistSong")
                            .attr('data-plIndex', plIndex)
                            .html(fileNameNoExt)));

                        tr.appendTo($playlistTbody);

                    } else if (fileExt == "PDF") {

                        $('<a/>')
                            .append(dir.filename)
                            .prop('href', filePath)
                            .prop('title', dir.filename)
                            .appendTo($thumbnailContainer);

                    } else if (dir.filename == "youtube.txt") {
                        // Get the list of youtube ids
                        var cPos = 0;
                        $.getJSON("getVideoList.php", "file=" + filePath, function (videoList) {
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
                                        .append("<tr><td>" + videoName + "</td></tr>")
                                        .append($('<tr>').append($('<td>')
                                            .append($('<iframe>')
                                                .prop('src', "//www.youtube.com/embed/" + videoId)
                                                .attr('allowfullscreen', true)))
                                        ).appendTo($thumbnailContainer);
                                }
                            });

                        });
                    }

                } else {
                    // If a directory, add the name with the folder icon
                    if (dir.filename.indexOf("images") >= 0 || dir.filename.indexOf("Smaller") >= 0 ||
                        dir.filename.indexOf("Thumbs") >= 0) {
                            // Ignore this folder
                    } else {
                        //console.log("Folder container, dir.filename = " + dir.filename);
                        $('<button>')
                            .append($('<span>').prop('class', "glyphicon glyphicon-folder-open").html(' ' + dir.filename))
                            .prop('class', 'btn dirButton MediaFolderLink')
                            .attr('data-dir', dirName + '/' + dir.filename)
                            .appendTo($folderContainer);
                    }

                }
                //.prop('style','margin-right: 10px; margin-bottom: 10px; border:1px solid;')
            });
            
            
            // if there were any MP3's, build a player with the playlist of MP3's
            if (audioFiles) {
                // append the tbody to the table, adn the table to the thumbnail container

                /*
                var source = document.createElement('source');
                //source.src = audioLink;
                source.src = '';
                audio.appendChild(source);
                */


                // *** this worked ***
                document.getElementById("MediaThumbnails").appendChild(audioPlayer);
                //$audioPlayer.appendTo($thumbnailContainer);

                // Load the first song in the playlist
                loadSong(0);

                var $playlistTable = $('<table>')
                    .attr('id', 'PlaylistDisplay')
                    .prop('class', 'table table-condensed');
                $playlistTbody.appendTo($playlistTable);

                $playlistTable.appendTo($thumbnailContainer);

                /*

<audio id="pop">
  <source src="audio/pop.wav" type="audio/mpeg">
</audio>
<audio controls>
  <source src="horse.mp3" type="audio/mpeg">
</audio>

$('audio#pop')[0].play()


  var audioLink=$(this).find("link").eq(1).attr("href"); //grab music file
            var audio= document.createElement('AUDIO');
               var source= document.createElement('source');
             audioLink= '"'+ audioLink + '"'
            $('source').attr('src', audioLink); //nothing found! source has not been appended to document
            $('audio').attr('controls','controls');//nothing found! audiohas not been appended to document
            $('source').attr('type', 'audio/mpeg');
                */

                /*
                $.getJSON("getMP3Filelist.php", "dir=" + dirName, function (resultPlaylist) {
                    console.log("after mp3 file call");
                    playlist = resultPlaylist;
                    loadPlaylist();
                }).fail(function (jqXHR, textStatus, exception) {
                    console.log("getJSON getMP3Filelist failed, textStatus = " + textStatus);
                    console.log("Exception = " + exception);
                });
                */
            }
                /*
                    <audio id="AudioPlayer" controls src="">
                                        Your browser does not support the audio element.
                    </audio>
                    <table id="AudioControlsContainer">
                        <tr>
                            <td><a id="AudioPrev" href="#" ><span class="glyphicon glyphicon-step-backward audioControlIcon"></span></a></td>
                            <td><a id="AudioNext" href="#"><span class="glyphicon glyphicon-step-forward audioControlIcon"></span></a></td>
                            <!--
                            <td><a id="AudioRandom" href="#"><span class="glyphicon glyphicon-random audioControlIcon"></span></a></td>
                            <td><a id="AudioRepeat" href="#"><span class="glyphicon glyphicon-retweet audioControlIcon"></span></a></td>
                            -->
                        </tr>
                    </table>
                    <table id="PlaylistDisplay" class="table table-condensed">
                        <tbody></tbody>
                    </table>
            */

        }).fail(function (jqXHR, textStatus, exception) {
            console.log("getJSON getDirList failed, textStatus = " + textStatus);
            console.log("Exception = " + exception);
        });

    } // function displayThumbnails(dirName,breadcrumbContainerName,folderContainerName,thumbnailContainerName) {

     // linkClass
     function setBreadcrumbs(dirName) {
         $breadcrumbContainer.empty();

         var dirArray = dirName.split("/");
         //console.log('setBreadcrumbs dirName = '+dirName);
         var urlStr = '';
         $.each(dirArray, function (index, dirName2) {
             if (index == dirArray.length - 1) {
                 $('<li>')
                     .prop('class', 'active')
                     .html(dirName2)
                     .appendTo($breadcrumbContainer);
             } else {
                 if (index == 0) {
                     urlStr += dirName2;
                 } else {
                     urlStr += '/' + dirName2;
                 }
                 $('<li>')
                     .append($('<a>').prop('href', '#').html(dirName2).prop('class', "MediaFolderLink").attr('data-dir', urlStr))
                     .appendTo($breadcrumbContainer);
             }
         });
     }


     // Audio ========================================================================================
    function loadSong(index) {
        plIndex = index;

        $("#AudioPlayer").attr("src", playlist[plIndex].url);
        audioPlayer.pause();
        audioPlayer.load();//suspends and restores all audio element
        //console.log("loaded audio, plIndex = "+plIndex);
        audioPlayer.oncanplaythrough = audioPlayer.play();

        /*
        var year = '';
        if (playlist[plIndex].year != '') {
            year = '(' + playlist[plIndex].year + ') ';
        }
        $('#currentArtistAlbum').html(playlist[plIndex].artist + " - " + year + playlist[plIndex].album);
        //$('#currentAlbum').html("Album: "+playlist[plIndex].album);
        var plNum = '' + (parseInt(plIndex) + 1);
        $('#currentTitle').html(plNum + ' - ' + playlist[plIndex].title);
        //audioPlayer.currentTime = 10.0;
        */
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

     
    //=================================================================================================================
    // This is what is exposed from this Module
    return {
    };
        
})(); // var mgallery = (function(){
