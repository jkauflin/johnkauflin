<?php
/*==============================================================================
 * (C) Copyright 2014 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION: Service to return the url path to a random photo in a dir
 *----------------------------------------------------------------------------
 * Modification History
 * 2014-11-12 JJK 	Initial version from old displayRandomImages function
 * 2016-04-04 JJK	Added a hard-coded root dir
 *============================================================================*/

$rootDir = '';
$photoURL = '';
try {
	if (isset($_REQUEST["rootDir"])) { 
	   $rootDir = urldecode($_REQUEST["rootDir"] . '/');
	} 

	if (file_exists($rootDir)) {
	    $files = scandir($rootDir);
	  	// filter out non images
	  	foreach($files as $file)  {
			if (stripos($rootDir . $file,'.JPG')) {
				$imagesArray[] = $file;
			}
	  	}
	  
	  	$arrayIndex = array_rand($imagesArray);
		$photoURL = $rootDir . $imagesArray[$arrayIndex];
			
	} // if (file_exists($rootDir)) {

}
catch (Exception $e) {
    //echo 'An error occured: ' .  $e->message;
}

echo $photoURL;
?>
