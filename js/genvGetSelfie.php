<?php
/*==============================================================================
(C) Copyright 2023 John J Kauflin, All rights reserved. 
-------------------------------------------------------------------------------
DESCRIPTION:  Get Genv info from the database
-------------------------------------------------------------------------------
Modification History
2023-11-25	Initial version - to get the next selfie image
================================================================================*/
// Define a super global constant for the log file (this will be in scope for all functions)
define("LOG_FILE", "./php.log");
require_once '../vendor/autoload.php';
// Figure out how many levels up to get to the "public_html" root folder
$webRootDirOffset = substr_count(strstr(dirname(__FILE__),"public_html"),DIRECTORY_SEPARATOR) + 1;
// Get settings and credentials from a file in a directory outside of public_html
// (assume a settings file in the "external_includes" folder one level up from "public_html"
$extIncludePath = dirname(__FILE__, $webRootDirOffset+1).DIRECTORY_SEPARATOR.'external_includes'.DIRECTORY_SEPARATOR;
// Credentials for the Media Gallery database
require_once $extIncludePath.'GenvSecrets.php';
require_once $extIncludePath.'jjkloginSettings.php';

use \jkauflin\jjklogin\LoginAuth;

function getConn($dbHost, $dbUser, $dbPassword, $dbName) {
	// User variables set in the db connection credentials include and open a connection
	$conn = new mysqli($dbHost, $dbUser, $dbPassword, $dbName);
	// Check connection
	if ($conn->connect_error) {
		error_log(date('[Y-m-d H:i:s] '). "Connection failed: " . $conn->connect_error . PHP_EOL, 3, LOG_FILE);
		die("Connection failed: " . $conn->connect_error);
	}
	return $conn;
}

$conn = null;
$row = null;
try {
    $loginAuth = new LoginAuth($hostJJKLogin, $dbadminJJKLogin, $passwordJJKLogin, $dbnameJJKLogin);
    $userRec = $loginAuth->getUserRec();
    if ($userRec->userName == null || $userRec->userName == '') {
        throw new Exception('User is NOT logged in', 500);
    }
    if ($userRec->userLevel < 9) {
        throw new Exception('User does not have Admin permissions', 500);
    }

	// Get the parameters sent as a JSON structure
	header("Content-Type: application/json; charset=UTF-8");
	// Get JSON as a string
	$json_str = file_get_contents('php://input');
	// Decode the string to get a JSON object
	$param = json_decode($json_str);
	
	// Get the database connection
	$conn = getConn($dbHost, $dbUser, $dbPassword, $dbName);

	//-----------------------------------------------------------------------------------
	// Album
	//-----------------------------------------------------------------------------------
	$sql = "SELECT * FROM genvMonitorConfig WHERE ConfigId = 1";
	$stmt = $conn->prepare($sql)  or die($mysqli->error);
	/*
	if ($param->selfieId > 0) {
		//$sql = "SELECT * FROM genvMonitorImg WHERE ImgId = ? ORDER BY ImgId DESC LIMIT 1; ";
		$sql = "SELECT * FROM genvMonitorImg ORDER BY ImgId DESC LIMIT 300; ";
		$stmt = $conn->prepare($sql);
		$stmt->bind_param("i",$param->selfieId);
	} else {
		$sql = "SELECT * FROM genvMonitorImg ORDER BY ImgId DESC LIMIT 300; ";
		$stmt = $conn->prepare($sql);
	}
	*/
	$sql = "SELECT * FROM genvMonitorImg ORDER BY ImgId DESC LIMIT 100; ";
	$stmt = $conn->prepare($sql);

	$stmt->execute();


	class ImgRec {
		public $imgId;
		public $lastChangeTs;
		public $imgData;
	}

	$outputArray = array();


	$result = $stmt->get_result();
	//$row = $result->fetch_assoc();
	if ($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			$imgRec = new ImgRec();
			$imgRec->imgId =$row["ImgId"];
			$imgRec->lastChangeTs =$row["LastChangeTs"];
			$imgRec->imgData =$row["ImgData"];
			array_push($outputArray,$imgRec);
		}
	}
	$stmt->close();

	// Close the database connection
	$conn->close();
	$conn = null;

}
catch (Exception $e) {
	error_log(date('[Y-m-d H:i] '). 'Exception = ' . $e . PHP_EOL, 3, LOG_FILE);
	if ($conn != null) {
		// Close the database connection
		$conn->close();
		$conn = null;
	}
}

//echo json_encode($row);
echo json_encode($outputArray);
?>
