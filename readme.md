I found this device on the internetz:

![GPS/GPRS Tracker](http://www.zhyichina.com/en/GPSTracking/TK102.jpg)

suitable for an application I was writing, bought one and I did some reverse engineering with telnet to discover its protocol. The result is this small library that you can use in your projects to write your servers and listen to positioning events.

Install
=======

	npm install gpstracker


Usage
=====

A very basic example will be this

	var gpstracker = require("gpstracker");

	var server = gpstracker.create().listen(8000, function(){
	    console.log('listening your gps trackers on port', 8000);
	});

	server.trackers.on("connected", function(tracker){
	    
	    console.log("tracker connected!", tracker.imei);
	    
	    tracker.on("position", function(position){
	        console.log("lat", position.lat, "lng", position.lng);
	    });

	    tracker.trackEvery(10).seconds();
	});


Licence
=======

I don't even know if this is legal, if not just let me know. This code is MIT licensed.