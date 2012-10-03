I found this device on the internetz:

![GPS/GPRS Tracker](http://www.zhyichina.com/en/GPSTracking/TK102.jpg)

suitable for an application I was writing, bought one and I did some reverse engineering with telnet to discover its protocol. The result is this small library that you can use in your projects to write your servers and listen to positioning events.

After that I [found an excel sheet](https://github.com/jfromaniello/node-gpstracker/blob/master/docs/GPRS-Data-Protocol.xls?raw=true) with the protocol very bad documented. The model name of this device seems "TK102", but I also found that the protocol is the same for various devices:

* TK102/TK102B 
* TK103/TK103B 
* TK104
* TK106/TK106B

Install
=======

	npm install gpstracker


Usage
=====

A very basic example will be this

```javascript
var gpstracker = require("gpstracker");
var server = gpstracker.create().listen(8000, function(){
    console.log('listening your gps trackers on port', 8000);
});

server.trackers.on("connected", function(tracker){
    
    console.log("tracker connected with imei:", tracker.imei);
    
    tracker.on("help me", function(){
        console.log(tracker.imei + " pressed the help button!!".red);
    });

	tracker.on("position", function(position){
        console.log("tracker {" + tracker.imei +  "}: lat", 
                            position.lat, "lng", position.lng);
    });

    tracker.trackEvery(10).seconds();
});
```

Licence
=======

I don't even know if this is legal, if not just let me know. This code is MIT licensed.