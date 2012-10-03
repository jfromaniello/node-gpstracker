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
      if(client.tracker && client.tracker.imei === chunk.toString()){
        //it is a heartbeat message, respond inmediately.
        client.write(new Buffer("ON"));
        return;
      }
      
      data += chunk.toString();
      if(data.indexOf(";") === -1) return;
      var messagesToProcess = data.split(";");
      for (var i = 0; i < messagesToProcess.length -1; i++) {
        processData(server, client, messagesToProcess[i]);
      }
      data = data.slice(data.lastIndexOf(";")+1);


      if(client.tracker && client.tracker.imei === data){
        //remaining is a heartbeat message, respond inmediately.
        client.write(new Buffer("ON"));
        data = "";
        return;
      }
    });
  });
  server.trackers = new EventEmitter();
  return server;
};

function processData(server, client, data){
  var messageParts = parseMessage(data.trim());

  if(messageParts && messageParts[2] == "A"){
    client.write(new Buffer("LOAD"));
    var tracker = new Tracker(client, extractImei(data));
    server.trackers[tracker.imei] = tracker;
    server.trackers.emit("connected", tracker);
    client.tracker = tracker;
    return;
  }

  if(messageParts && messageParts[4] && messageParts[4] === "F"){
    var imei = extractImei(data),
        thisTracker = server.trackers[imei];
    if(!thisTracker){
      server.trackers.emit("error", new Error("position receive from unknown imei"));
      return;
    }
    thisTracker.emit("position", new Position(data));
  }

  if(messageParts && messageParts[1] === "help me"){
    var imei = extractImei(data),
        thisTracker = server.trackers[imei];

    if(!thisTracker){
      server.trackers.emit("error", new Error("position receive from unknown imei"));
      return;
    }

    thisTracker.emit("help me", null);
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