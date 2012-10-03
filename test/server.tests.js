var trackerServer = require("../lib/server"),
    Socket = require("net").Socket;

describe("gps tracker server", function() {
  beforeEach(function(done) {
    this.server = trackerServer.create().listen(7000, done);
  });

  afterEach(function(done) {
    this.server.on("close", function(){
      done();
    });
    this.server.close();
  });

  it("should send LOAD when connecting", function(done) {
    new Socket().connect(7000, function(){
      this.write("##,imei:787878,A;");
    }).on("data", function(data){
      data.toString().should.eql("LOAD");
      this.end();
    }).on("end", function(){
      done();
    }); 
  });

  it("should send LOAD when connecting with aditional crap chars", function(done) {
    new Socket().connect(7000, function(){
      this.write("\n##,imei:787878,A;");
    }).on("data", function(data){
      data.toString().should.eql("LOAD");
      this.end();
    }).on("end", function(){
      done();
    }); 
  });

  it("should send LOAD when connecting with aditional crap chars 2", function(done) {
    new Socket().connect(7000, function(){
      this.write("\n!opid##,imei:787878,A;");
    }).on("data", function(data){
      data.toString().should.eql("LOAD");
      this.end();
    }).on("end", function(){
      done();
    }); 
  });

  it("should emit the connected event on the trackers object", function(done) {
    var s = new Socket().connect(7000, function(){
      this.write("##,imei:787878,A;");
    }).on("end", function(){
      done();
    });
    this.server.trackers.on("connected", function(tracker){
      tracker.imei.should.eql("787878");
      s.end();
    });
  });

  [
    ["seconds", 1, "01s"],
    ["minutes", 2, "02m"],
    ["hours",  20, "20h"],
    ["meters",  4, "0004m"]
  ].forEach(function(tuple){
    it("should be able to do multi tracking in " + tuple[0], function(done) {
      var s = new Socket().connect(7000, function(){
        this.write("##,imei:787878,A;");
      }).on("data", function(data){
        if(data.toString() === "LOAD") return;
        data.toString().should.include("**,imei:787878,C," + tuple[2]);
        s.end();
      }).on("end", function(){
        done();
      });

      this.server.trackers.on("connected", function(tracker){
        tracker.trackEvery(tuple[1])[tuple[0]]();
      });
    });
  });

  it("should be able to request the position once", function(done) {
    var s = new Socket().connect(7000, function(){
      this.write("##,imei:787878,A;");
    }).on("data", function(data){
      if(data.toString() === "LOAD") return;
      data.toString().should.include("**,imei:787878,B");
      s.end();
    }).on("end", function(){
      done();
    });

    this.server.trackers.on("connected", function(tracker){
      tracker.getPosition();
    });
  });

  it("should emit the position event", function(done) {
    var s = new Socket().connect(7000, function(){
      this.write("##,imei:787878,A;");
      this.write(new Buffer("imei:787878,tracker,1208080907,,F,120721.000,A,3123.1244,S,06409.8181,W,100.00,0;"));
    }).on("end", function(){
      done();
    });

    this.server.trackers.on("connected", function(tracker){
      tracker.on("position", function(position){
        position.imei.should.eql("787878");
        position.lat.should.eql(-31.385407);
        position.lng.should.eql(-64.163635);
        position.date.getTime().should.eql(new Date(2012, 8, 8, 9, 7).getTime());
        position.speed.should.eql(185);
        s.end();
      });
    });

  });

  it("should emit the position event with aditional crap characters", function(done) {
    var s = new Socket().connect(7000, function(){
      this.write("##,imei:787878,A;");
      this.write(new Buffer("!\nrsimei:787878,tracker,1208080907,,F,120721.000,A,3123.1244,S,06409.8181,W,100.00,0;"));
    }).on("end", function(){
      done();
    });

    this.server.trackers.on("connected", function(tracker){
      tracker.on("position", function(position){
        position.lat.should.eql(-31.385407);
        position.lng.should.eql(-64.163635);
        position.date.getTime().should.eql(new Date(2012, 8, 8, 9, 7).getTime());
        position.speed.should.eql(185);
        s.end();
      });
    });

  });

  it("should respond to the heartbeat with ON", function(done) {
    var s = new Socket().connect(7000, function(){
      this.write("##,imei:787878,A;");
      this.write(new Buffer("787878"));
    }).on("data", function(chunk){
      if(chunk.toString() === "ON" || chunk.toString().slice(-2) === "ON"){
        s.end();        
      }
    }).on("end", function(){
      done();
    });
  });

  it("should emit 'help me' without position when receiving just the help me command", function(done) {
    var emited;
    var s = new Socket().connect(7000, function(){
      this.write("##,imei:787878,A;");
      this.write("imei:787878,help me,000000000,13554900601,L,;");
      this.write("787878");
    }).on("end", function(){
      emited.should.be.true;
      done();
    });
    this.server.trackers.on("connected", function(tracker){
      tracker.on("help me", function(){
        emited = true;
        s.end();
      });
    });
  });

  it("should emit 'help me' and 'position' when receiving help me command", function(done) {
    var emited;
    var s = new Socket().connect(7000, function(){
      this.write("##,imei:787878,A;");
      this.write("imei:787878,help me,1208080907,,F,120721.000,A,3123.1244,S,06409.8181,W,100.00,0;");
      this.write("787878");
    }).on("end", function(){
      emited.should.be.true;
      done();
    });
    this.server.trackers.on("connected", function(tracker){
      tracker.on("position", function(position){
        position.imei.should.eql("787878");
        position.lat.should.eql(-31.385407);
        position.lng.should.eql(-64.163635);
        position.date.getTime().should.eql(new Date(2012, 8, 8, 9, 7).getTime());
        position.speed.should.eql(185);
        emited = true;
      }).on("help me", function(){
        s.end();
      });
    });
  });

});



//TODO more commands to implement:
//**,imei:359710040229297,G       movement alarm
//**,imei:359710040229297,H,060   speed alarm in km/hs
//**,imei:359710040229297,E       stop alarm
//**,imei:359710040229297,O,-31.379971,-064.177948;-31.388771,-064.159718 // (square) virtual fence
//**,imei:359710040229297,P       cancel virtual fenge
//I dont know yet the response for the alarms.