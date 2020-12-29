/*==============================================================================
 * (C) Copyright 2020 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION: Spotify functions for the website.  It uses the following
 *  API wrapper to call the Spotify RESTful services:
 *      https://github.com/JMPerez/spotify-web-api-js
 *      https://jmperezperez.com/spotify-web-api-js/
 *      https://developer.spotify.com/documentation/web-api/reference-beta/#category-library
 * 
 * Documentation for the PHP API wrapper:
 *      https://github.com/jwilsson/spotify-web-api-php/tree/master/docs
 *      https://github.com/jwilsson/spotify-web-api-php
 * 
 *----------------------------------------------------------------------------
 * Modification History
 * 2020-12-17 JJK 	Initial version
 * 2020-12-28 JJK   Adding function to read user library and playlists
 *============================================================================*/
var spotify = (function () {
	'use strict';  // Force declaration of variables before use (among other things)
	//=================================================================================================================
	// Private variables for the Module
    // Tokens obtained by backend server processes that have authenticated the user to Spotify,
    // received a callback from Spotify, and passed the tokens in a re-direct to client browser
    // The re-direct will re-load the page (maybe don't re-direct back to index - have a player.html)
    var access_token = urlParam('access_token');
    var refresh_token = urlParam('refresh_token');
    //console.log("in Music, access_token = " + access_token);
    //console.log("in Music, refresh_token = " + refresh_token);

    // Open source wrapper around the Spotify API (to simplify the calls)
    var spotifyApi = new SpotifyWebApi();
    // Global references to a web browser player device created in the browser javascript
    var player;
    // Device Id for the web browser player device
    var deviceId;

	//=================================================================================================================
	// Variables cached from the DOM
	var $document = $(document);
    var $PlaylistPage = $('#PlaylistPage');
    var $jjkloginEventElement = $document.find('#jjkloginEventElement')
    var $PlaylistNav = $document.find('#PlaylistNav');
    var $SpotifyIcon = $document.find("#SpotifyIcon");

	//=================================================================================================================
    // Bind events
    $jjkloginEventElement.on('userJJKLoginAuth', function (event) {
        //console.log('After login, username = ' + event.originalEvent.detail.userName);
        if (event.originalEvent.detail.userLevel > 5) {
            // If the user has authorization, make the Playlist menu item visible
            $PlaylistNav.removeClass("d-none");
        }
    });

    $PlaylistPage.on("click", "#CreatePlaylist", _createPlaylist);

    if (access_token == null || access_token == undefined) {
        // No access token
        /*
        window.onSpotifyWebPlaybackSDKReady = () => {
        };
        */
    } else {
        // If an access token is included on the URL, set into the API, replace
        // the black logo with the green logo, and activate the playlist tab
        spotifyApi.setAccessToken(access_token);
        $SpotifyIcon.attr("src", "Media/images/Spotify_Icon_RGB_Green.png");

        $(".nav-link.active").removeClass("active");
        $('.navbar-nav a[href="#PlaylistPage"]').tab('show')
        $('.navbar-nav a[href="#PlaylistPage"]').addClass('active');

        /*
        window.onSpotifyWebPlaybackSDKReady = () => {
            const token = access_token;
            player = new Spotify.Player({
                name: 'Web Playback SDK Quick Start Player',
                getOAuthToken: cb => {
                    cb(token);
                }
            });

            // Error handling
            player.addListener('initialization_error', ({
                message
            }) => {
                console.error(message);
            });
            player.addListener('authentication_error', ({
                message
            }) => {
                console.error(message);
            });
            player.addListener('account_error', ({
                message
            }) => {
                console.error(message);
            });
            player.addListener('playback_error', ({
                message
            }) => {
                console.error(message);
            });

            // Playback status updates
            player.addListener('player_state_changed', state => {
                console.log(state);
            });

            // Ready
            player.addListener('ready', ({
                device_id
            }) => {
                console.log('Ready with Device ID', device_id);
                deviceId = device_id;
            });

            // Not Ready
            player.addListener('not_ready', ({
                device_id
            }) => {
                console.log('Device ID has gone offline', device_id);
            });

            // Connect to the player!
            player.connect();
        };
        */
    }

    function _createPlaylist() {

        var totalItems = 0;
        var queryLimit = 10;
        var queryOffset = 0;
        var itemsRead = 0;
        /*
        do {
            spotifyApi.getMySavedTracks({ limit: queryLimit, offset: queryOffset })
                .then(function (response) {
                    console.log(response);
                    console.log("items.length = " + response.items.length);
                    console.log("total = " + response.total);
                    totalItems = response.total;
                    //itemRead = itemsRead + response.items.length;
                    $.each(response.items, function (index, item) {
                        console.log(index + " item.track.name = " + item.track.name);
                    });
                })
                .catch(function (err) {
                    console.error(err);
                });
            util.sleep(3000);
        }
        while (itemsRead < totalItems);
        */

    } // function _createPlaylist() {


    function stop() {
        if (player != null) {
            player.pause().then(() => {
                console.log('Paused!');
            });
        }
        /*
        player.togglePlay().then(() => {
            console.log('Toggled playback!');
        });
        */
    }

    function play() {
        console.log("in play");
        player.resume().then(() => {
            console.log('Resumed!');
        });
    }

    function searchAndPlay(searchStr, searchType) {
        // Search spotify
        console.log("in searchAndPlay, searchStr = " + searchStr + ", searchType = " + searchType);
        // try song, then artist, then playlist ?  or playlist first?

        // search types                    ['album', 'artist', 'playlist', 'track']

        //var options = {limit:1};

        spotifyApi.search(
            searchStr,
            [searchType],
            { limit: 1 }
            , function (err, response) {
                if (err) console.error(err);
                else {
                    /*
                    console.log('Search response = ' + JSON.stringify(response));
                    console.log('Search response.artists = ' + response.artists);
                    console.log('Search response.albums = ' + response.albums);
                    console.log('Search response.playlist = ' + response.playlist);
                    console.log('Search response.tracks = ' + response.tracks);
                    */

                    var contextUri;
                    var uris;

                    if (response.tracks != undefined) {
                        uris = [response.tracks.items[0].uri];
                    }
                    else if (response.artists != undefined) {
                        contextUri = [response.artists.items[0].uri];
                        //  "uri": "spotify:artist:08td7MxkoHQkXnWAYD8d6Q"
                    }
                    else if (response.albums != undefined) {
                        contextUri = [response.albums.items[0].uri];
                    }
                    else if (response.playlist != undefined) {
                        contextUri = [response.playlist.items[0].uri];
                    }

                    //console.log("uris = " + JSON.stringify(uris));

                    // If there is a track, just starting playing the first one
                    if (uris != undefined && deviceId != undefined) {
                        spotifyApi.play({
                            "device_id": deviceId,
                            "uris": uris
                        }, function (err, data) {
                            if (err) console.error(err);
                            else console.log('Playing track');
                        });
                    }
                    /*
                    else if (contextUri != undefined && deviceId != undefined) {
                        spotifyApi.play({
                            "device_id": deviceId,
                            "context_uri": contextUri
                        }, function (err, data) {
                            if (err) console.error(err);
                            else console.log('Playing song');
                        });
                    }
                    */

                }
            });


        /*

for (let prop in obj) {
console.log(obj[prop]);
}

for (i in myObj.cars) {
x += myObj.cars[i];
}
        if (response.length > 0) {
            if (response[0].score > 1) {
                sayAndAnimate(response[0].verbalResponse);
                if (response[0].robotCommand != null && response[0].robotCommand != '') {
                    _executeBotCommands(response[0].robotCommand);
                }
            }
        }


        // Despacito
            "uris": ["spotify:track:6habFhsOp2NvshLv26DqMb"]

        spotifyApi.play({
            "device_id": deviceId,
            "uris": ["spotify:track:6habFhsOp2NvshLv26DqMb"]
        }, function (err, data) {
            if (err) console.error(err);
            else console.log('Playing song');
        });
        */
    }

    function testPlay() {
        console.log("in testPlay");

        player.getVolume().then(volume => {
            let volume_percentage = volume * 100;
            console.log(`The volume of the player is ${volume_percentage}%`);
        });

        spotifyApi.play(
            {
                "device_id": deviceId,
                "uris": ["spotify:track:5ya2gsaIhTkAuWYEMB0nw5"]
            }, function (err, data) {
                if (err) console.error(err);
                else console.log('Playing song');
            });
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

	//=================================================================================================================
	// Module methods


	//=================================================================================================================
	// This is what is exposed from this Module
	return {
	};

})(); // var spotify = (function(){
