/*==============================================================================
(C) Copyright 2019 John J Kauflin, All rights reserved. 
-----------------------------------------------------------------------------
DESCRIPTION: NodeJS server to run console utilies for the web site
-----------------------------------------------------------------------------
Modification History
2019-02-11 JJK  Initial version
=============================================================================*/

// General handler for any uncaught exceptions
process.on('uncaughtException', function (e) {
    console.log("UncaughtException, error = " + e);
    console.error(e.stack);
    // Stop the process
    // 2017-12-29 JJK - Don't stop for now, just log the error
    //process.exit(1);
});

// Read environment variables from the .env file
require('dotenv').config();

const https = require('https');
const http = require('http');
var getJSON = require('get-json');
const url = require('url');
var dateTime = require('node-datetime');

// Create a web server
/*
var express = require('express');
var app = express();
var webServer;
webServer = new http.createServer(app).listen(process.env.WEB_PORT, function () {
    console.log("Live at Port " + process.env.WEB_PORT + " - Let's rock!");
});

app.use('/', express.static('public'));

app.use("*", function (req, res) {
    console.log("Not in Public, URL = " + req.url);
    res.sendFile(path + "404.html");
});

// jjk new
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})
*/

// List all files in a directory in Node.js recursively in a synchronous fashion
var walkSync = function (dir, filelist) {
    var path = path || require('path');
    var fs = fs || require('fs'),
    files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
            // check for image file first???
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
};

//var dir = "E:\\jjkPhotos";
var dir = "E:\\jjkPhotos\\1 John J Kauflin\\1994-to-2001\\1998";
var fileList = walkSync(dir);

/*
for (var i = 0, len = fl.length; i < len; i++) {
    console.log("fl[" + i + "] = " + fl[i]);
}
*/

var backSlashRegExp = new RegExp("\\\\", "g");

// Start recursive function
createThumbnail(0);

function createThumbnail(index) {
    var fileNameAndPath = fileList[index].substring(3).replace(backSlashRegExp, "/");
    var tempUrl = process.env.BOT_WEB_URL + 'createThumbnail.php?file=' + fileNameAndPath + '&UID=' + process.env.UID;
    //console.log("tempUrl = " + tempUrl);
    //console.log(index + " of " + fileList.length + ", file = " + fileNameAndPath);

    https.get(tempUrl, (resp) => {
        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            //console.log("data = " + data);
            // Maybe return if it created one or not?  and do less time if not created
            console.log(dateTime.create().format('Y-m-d H:M:S ') + index + " of " + fileList.length + ", " + fileNameAndPath + ", " + data);
            var delayMs = 2000;
            if (data == 'Created') {
                delayMs = 4000;
            }
            if (index < fileList.length - 1) {
                setTimeout(createThumbnail, delayMs, index + 1);
            }
        });

    }).on("error", (e) => {
        console.log("Error: " + e.message);
        // Wait 10 seconds and try the same one again
        setTimeout(createThumbnail, 10000, index);

        //Error: connect ETIMEDOUT 173.205.127.190:443

        /* need a timestamp here
        6539 of 19768, file = jjkPhotos/1 John J Kauflin/2009-to-2015/2013/03 Summer/2013-07-02 098.JPG, Already exists
6540 of 19768, file = jjkPhotos/1 John J Kauflin/2009-to-2015/2013/03 Summer/2013-07-02 099.JPG, Already exists
6541 of 19768, file = jjkPhotos/1 John J Kauflin/2009-to-2015/2013/03 Summer/2013-07-02 106.JPG, Already exists
6542 of 19768, file = jjkPhotos/1 John J Kauflin/2009-to-2015/2013/03 Summer/2013-07-15 011.JPG, Already exists
6543 of 19768, file = jjkPhotos/1 John J Kauflin/2009-to-2015/2013/03 Summer/2013-07-15 013.JPG, Already exists
6544 of 19768, file = jjkPhotos/1 John J Kauflin/2009-to-2015/2013/03 Summer/2013-07-15 017.JPG, Already exists
Error: connect ETIMEDOUT 173.205.127.190:443
*/
    });

} // function createThumbnail(fileNameAndPath) {


