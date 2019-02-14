<?php
/*==============================================================================
 * (C) Copyright 2014 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION: 
 *----------------------------------------------------------------------------
 * Modification History
 * 2014-04-03 JJK 	Initial version to return a validate dir or blank
 *============================================================================*/

$dirStr = '';
try {
	$rootDir = '';				
	if (isset($_GET["dir"])) { 
		$rootDir = $_GET["dir"];
	} 

	if (file_exists($rootDir)) {
		$dirStr = $rootDir;		
	} // End of if (file_exists($rootDir)) {
}
catch (Exception $e) {
    //echo 'An error occured: ' .  $e->message;
}

echo $dirStr;
?>
