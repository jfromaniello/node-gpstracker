var server = module.exports,
    net = require("net"),
    EventEmitter = require("events").EventEmitter,
    Tracker = require("./tracker"),
    Position = require("./position");


server.create = function(){
  var server = net.createServer(function(client){
    var data = "",
        tracker;
    client.on("data", function(chunk){
      data += chunk.toString();
      if(data.indexOf(";") === -1) return;
      var messagesToProcess = data.split(";");
      for (var i = 0; i < messagesToProcess.length -1; i++) {
        processData(server, client, messagesToProcess[i]);
      }
      data = data.slice(data.lastIndexOf(";")+1);
    });
  });
  server.trackers = new EventEmitter();
  return server;
};

function processData(server, client, data){
  var messageParts = parseMessage(data);

  if(messageParts && messageParts[0] === "##" && messageParts[2] == "A"){
    client.write(new Buffer("LOAD"));
    var tracker = new Tracker(client, extractImei(data));
    server.trackers[tracker.imei] = tracker;
    server.trackers.emit("connected", tracker);
    return;
  }

  if(messageParts && messageParts[0].substr(0,4) === "imei"){
    var imei = extractImei(data),
        thisTracker = server.trackers[imei];
    if(!thisTracker){
      server.trackers.emit("error", new Error("position receive from unknown imei"));
      return;
    }
    thisTracker.emit("position", new Position(data));
  }
}

/*
 * extract the IMEI of a message 
 */ 
function extractImei(message){
  return (/imei\:([0-9]*)/).exec(message)[1];
}

function parseMessage(message){
  return message.split(",");
}