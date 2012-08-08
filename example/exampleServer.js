var gpstracker = require("../lib/server");

var server = gpstracker.create().listen(8000, function(){
    console.log('listening your gps trackers on port', 8000);
});

server.trackers.on("connected", function(tracker){
    
    console.log("tracker connected with imei:", tracker.imei);
    
    tracker.on("position", function(position){
        console.log("tracker {" + tracker.imei +  "}: lat", 
                            position.lat, "lng", position.lng);
    });

    tracker.trackEvery(10).seconds();
});