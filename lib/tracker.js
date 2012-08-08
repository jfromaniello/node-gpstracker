var EventEmitter = require("events").EventEmitter;

function Tracker(client, imei){
  EventEmitter.call(this);

  this.imei = imei;
  this.client = client;
}

Tracker.prototype = Object.create(EventEmitter.prototype);

/*
 * usage: tracker.trackEvery(10).seconds();
 *        tracker.trackEvery(1).hours();
 *        tracker.trackEvery(10).meters();
 */
Tracker.prototype.trackEvery = function(value){
  var result = {},
      thisTracker = this, 
      multiTrackFormat = {
        "seconds": [2,"s"],
        "minutes": [2,"m"],
        "hours":   [2,"h"],
        "meters":  [4,"m"]
      };
  Object.keys(multiTrackFormat)
    .forEach(function(k){
      result[k] = function(){
        var format = multiTrackFormat[k],
            interval = Array(format[0] - String(value).length + 1).join('0')+ value + format[1],
            message = "**,imei:" + thisTracker.imei + ",C," + interval;
        thisTracker.client.write(new Buffer(message));
      };
    });

  return result;
};

Tracker.prototype.getPosition = function(){
  this.client.write(new Buffer("**,imei:" + this.imei + ",B"));
};


module.exports = Tracker;