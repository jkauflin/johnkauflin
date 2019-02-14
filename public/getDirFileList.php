<?php
/*==============================================================================
 * (C) Copyright 2014,2016 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION: Recurse through a directory and get list of sub-directories
 *              and files
 *----------------------------------------------------------------------------
 * Modification History
 * 2014-04-03 JJK 	Initial version to return a directory list
 *============================================================================*/

$outputArray = array();
try {
	$rootDir = '';				
	if (isset($_GET["dir"])) { 
		$rootDir = $_GET["dir"];
		// make sure it starts with data or Photos
		if (!(substr($rootDir,0,3) == 'jjk')) {
			die("Dir list limited to specified directories");
		}
	} 

	$sort = '0';				
	if (isset($_GET["sort"])) { 
		$sort = $_GET["sort"];
	} 

	$fileNamePart = '';
	$extension = '';

	if (file_exists($rootDir)) {
		$nextLevelDir = '';
		//error_log(date('[Y-m-d H:i] '). '$rootDir = ' . $rootDir . PHP_EOL, 3, 'php.log');
		$files = scandir($rootDir,$sort);

		$fileURL = '';
		foreach($files as $file)  {
			// Make sure it is a valid directory
			if ($file != "." && $file != "..") {
				//error_log(date('[Y-m-d H:i] '). '$file = ' . $file . PHP_EOL, 3, 'php.log');
				$fileURL = $rootDir.'/'.$file;
				if (is_dir($fileURL)) {
					$dirContents = array();
					$files2 = scandir($fileURL,$sort);
					foreach($files2 as $file2) {
						if ($file2 != "." && $file2 != "..") {
							array_push($dirContents,$file2);
						}
					}
					$outputArray[$file] = $dirContents;
				} else {
					$outputArray[$file] = $fileURL;
				}
				
			} // if ($file != "." && $file != "..") {
		} // foreach($files as $file)  {
	} // End of if (file_exists($rootDir)) {

}
catch (Exception $e) {
    //echo 'An error occured: ' .  $e->message;
}

echo json_encode($outputArray);

?>
