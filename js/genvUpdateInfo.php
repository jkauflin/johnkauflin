<?php
/*==============================================================================
 * (C) Copyright 2023 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION:	Update Genv info to the database
 *----------------------------------------------------------------------------
 * Modification History
 * 2023-09-15 JJK 	Initial version
 * 2023-09-29 JJK	Added update of other dates
 *============================================================================*/
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
$returnMsg = "Record Save started";
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

	//error_log(date('[Y-m-d H:i] '). '$sql = ' . $sql . PHP_EOL, 3, LOG_FILE);
	$conn = getConn($dbHost, $dbUser, $dbPassword, $dbName);

	$currTs = date('Y-m-d H:i:s');
	$returnMsg = "";
	if ($param->requestCommand != "") {
		$sql = "UPDATE genvMonitorConfig SET RequestCommand=?,RequestValue=?," .
				"LastUpdateTs=? WHERE ConfigId = 1 ";
		$stmt = $conn->prepare($sql);
		$stmt->bind_param("sss",$param->requestCommand,$param->requestValue,$currTs);
		$stmt->execute();
		$stmt->close();
		$returnMsg = $param->requestCommand . " Request updated " . date("h:i:sa");

	} else {
		$sql = "UPDATE genvMonitorConfig SET ConfigDesc=?,DaysToBloom=?,DaysToGerm=?,GerminationStart=?,PlantingDate=?," .
			"HarvestDate=?,CureDate=?,ProductionDate=?,TargetTemperature=?," . 
			"HeatInterval=?,HeatDuration=?,WaterDuration=?,WaterInterval=?,ConfigCheckInterval=?,ReturnMessage=''," . 
			"LastUpdateTs=? WHERE ConfigId = 1 ";
		$stmt = $conn->prepare($sql);
		$stmt->bind_param("sssssssssssssss",$param->configDesc,$param->daysToBloom,$param->daysToGerm,
			$param->germinationStart,$param->plantingDate,
			$param->harvestDate,$param->cureDate,$param->productionDate,
			$param->targetTemperature,$param->heatInterval,$param->heatDuration,
			$param->waterDuration,$param->waterInterval,$param->configCheckInterval,$currTs);
		$stmt->execute();
		$stmt->close();
		$returnMsg = date("h:i:sa");
	}

	$conn->close();
}
catch (Exception $e) {
	$listInfo->returnMsg = "Error in Update";
	error_log(date('[Y-m-d H:i] '). 'Exception = ' . $e . PHP_EOL, 3, LOG_FILE);
	if ($conn != null) {
		// Close the database connection
		$conn->close();
		$conn = null;
	}
}

echo $returnMsg;

?>
