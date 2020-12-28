<?php
/*==============================================================================
* (C) Copyright 2019 John J Kauflin, All rights reserved.
*----------------------------------------------------------------------------
* DESCRIPTION: Spotify login to call the PHP versions of the API for
*              authorization
*----------------------------------------------------------------------------
* Modification History
* 2019-04-21 JJK  Initial version
* 2020-05-10 JJK  Updated to latest version of the library and ran:
*   composer require jwilsson/spotify-web-api-php
* 2020-12-27 JJK  Updated for new include logic
*============================================================================*/
// Define a super global constant for the log file (this will be in scope for all functions)
define("LOG_FILE", "./php.log");
// Assume /vendor is 3 levels up from a file in the package root
require_once 'vendor/autoload.php';

// Figure out how many levels up to get to the "public_html" root folder
$webRootDirOffset = substr_count(strstr(dirname(__FILE__),"public_html"),DIRECTORY_SEPARATOR) + 1;
// Get settings and credentials from a file in a directory outside of public_html
// (assume a settings file in the "external_includes" folder one level up from "public_html"
$extIncludePath = dirname(__FILE__, $webRootDirOffset+1).DIRECTORY_SEPARATOR.'external_includes'.DIRECTORY_SEPARATOR;
require_once $extIncludePath.'jjkloginSettings.php';
require_once $extIncludePath.'jjkSpotifySettings.php';

    //error_log(date('[Y-m-d H:i] ') . '$SPOTIFY_REDIRECT_URI = ' . $SPOTIFY_REDIRECT_URI . PHP_EOL, 3, 'php.log');

    use \jkauflin\jjklogin\LoginAuth;
    $userRec = LoginAuth::getUserRec($cookieNameJJKLogin,$cookiePathJJKLogin,$serverKeyJJKLogin);
    if ($userRec->userName == null || $userRec->userName == '') {
        throw new Exception('User is NOT logged in', 500);
    }
    if ($userRec->userLevel < 5) {
        throw new Exception('User does not have permission for this function', 500);
    }

    $session = new SpotifyWebAPI\Session(
        $SPOTIFY_CLIENT_ID_JJK,
        $SPOTIFY_CLIENT_SECRET_JJK,
        $SPOTIFY_CALLBACK_URI_JJK
    );

    /*
            'streaming',
            'user-read-email',
            'user-read-private',
            'user-read-playback-state',
            'user-read-currently-playing',
            'user-modify-playback-state'
    */

    $options = [
        'scope' => [
            'streaming',
            'user-read-currently-playing',
            'user-modify-playback-state'
        ],
    ];

    header('Location: ' . $session->getAuthorizeUrl($options));
    die();

?>