<?php
/*==============================================================================
 * (C) Copyright 2014 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION: 
 *----------------------------------------------------------------------------
 * Modification History
 * 2014-04-03 JJK 	Initial version to return a validate dir or blank
 *============================================================================*/

$artistParam = '';
$albumParam = '';	

try {
	if (isset($_REQUEST["rootDir"])) { 
	   $bandsRootDir = urldecode($_REQUEST["rootDir"]);
	} 
	$dirStr = $bandsRootDir;
	
	if (isset($_REQUEST["artist"])) { 
	   $artistParam = urldecode($_REQUEST["artist"]);
	} 
	if (isset($_REQUEST["album"])) { 
	   $albumParam = urldecode($_REQUEST["album"]);
	} 

	if (!empty($artistParam) && !empty($albumParam)) {
		$dirStr = $bandsRootDir . '/' . $artistParam . '/' . $albumParam;
		if (!file_exists($dirStr)) {
			$dirStr = $bandsRootDir . '/' . $artistParam;
			if (!file_exists($dirStr)) {
				$dirStr = $bandsRootDir;
			}
		}
	} else if (!empty($artistParam)) {
		$dirStr = $bandsRootDir . '/' . $artistParam;
		if (!file_exists($dirStr)) {
			$dirStr = $bandsRootDir;
		}
	}

}
catch (Exception $e) {
    //echo 'An error occured: ' .  $e->message;
}

echo $dirStr;
?>
