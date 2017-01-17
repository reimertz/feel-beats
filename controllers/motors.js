var five = require("johnny-five"),
    deferred = require('deferred'),
    board,
    leftWrist,
    rightWrist,
    leftFoot,
    rightFoot,
    Motors = {};

Motors.initiate = function(){
  var isInitiated = new deferred();

  board = new five.Board();
  board.on("ready", function() {

    // Assuming a sensor is attached to pin "A1"
    // Assuming a button is attached to pin 9
    // Assuming a sensor is attached to pin "A1"
    //this.pinMode(1, five.Pin.ANALOG);
    //  this.analogRead(1, function(voltage) {
    //   console.log(voltage);
    //});

      //Blue
      leftWrist = new five.Motor({ 
        pin: 5
      });
      //White
      rightWrist = new five.Motor({  
        pin: 6
      });
      //Red
      leftFoot = new five.Motor({
        pin: 10
      });
      //Green
      rightFoot = new five.Motor({
        pin: 11
      });

      board.repl.inject({
        leftWrist: leftWrist ,
        rightWrist: rightWrist,
        leftFoot: leftFoot ,
        rightFoot: rightFoot
      });

      //Test
      Motors.shakeLeftWrist(500,255);
      Motors.shakeRightWrist(500,255);
      Motors.shakeLeftFoot(500,255);
      Motors.shakeRightFoot(500,255);

      return isInitiated.resolve();
  });

  return isInitiated.promise();
}

//Blue
Motors.shakeLeftWrist = function(duration, velocity) {
  shakeMotor(leftWrist, duration, velocity);
}

//White
Motors.shakeRightWrist = function(duration, velocity) {
  shakeMotor(rightWrist, duration, velocity);
}

//Red
Motors.shakeLeftFoot = function(duration, velocity) {
  shakeMotor(leftFoot, duration, velocity);
}

//Green
Motors.shakeRightFoot = function(duration, velocity) {
  shakeMotor(rightFoot, duration, velocity);
}

Motors.noteToMotorMapping = {
  35: { "motor": [Motors.shakeRightFoot], "name": "Acoustic Bass Drum" },
  36: { "motor": [Motors.shakeRightFoot], "name": "Bass Drum 1" },
  37: { "motor": [Motors.shakeLeftWrist], "name": "Side Stick" },
  38: { "motor": [Motors.shakeLeftWrist], "name": "Acoustic Snare" },
  39: { "motor": [Motors.shakeLeftWrist, Motors.shakeRightWrist] , "name": "Hand Clap" },
  40: { "motor": [Motors.shakeLeftWrist], "name": "Electric Snare" },
  41: { "motor": [Motors.shakeRightWrist], "name": "Low Floor Tom" },
  42: { "motor": [Motors.shakeRightWrist], "name": "Closed Hi Hat" },
  43: { "motor": [Motors.shakeRightWrist], "name": "High Floor Tom" },
  44: { "motor": [Motors.shakeLeftFoot], "name": "Pedal Hi-Hat" },
  45: { "motor": [Motors.shakeRightWrist], "name": "Low Tom" },
  46: { "motor": [Motors.shakeRightWrist], "name": "Open Hi-Hat" },
  47: { "motor": [Motors.shakeRightWrist], "name": "Low-Mid Tom" },
  48: { "motor": [Motors.shakeRightWrist], "name": "Hi-Mid Tom" },
  49: { "motor": [Motors.shakeLeftWrist], "name": "Crash Cymbal 1" },
  50: { "motor": [Motors.shakeRightWrist], "name": "High Tom" },
  51: { "motor": [Motors.shakeLeftWrist], "name": "Ride Cymbal 1" },
  52: { "motor": [Motors.shakeRightWrist], "name": "Chinese Cymbal" },
  53: { "motor": [Motors.shakeLeftWrist], "name": "Ride Bell" },
  54: { "motor": [Motors.shakeLeftWrist, Motors.shakeRightWrist], "name": "Tambourine" },
  55: { "motor": [Motors.shakeLeftWrist], "name": "Splash Cymbal" },
  56: { "motor": [Motors.shakeLeftWrist], "name": "Cowbell" },
  57: { "motor": [Motors.shakeRightWrist], "name": "Crash Cymbal 2" },
  58: { "motor": null, "name": "Vibraslap" },
  59: { "motor": [Motors.shakeRightWrist], "name": "Ride Cymbal 2" },
  60: { "motor": null, "name": "Hi Bongo" },
  61: { "motor": null, "name": "Low Bongo" },
  62: { "motor": null, "name": "Mute Hi Conga" },
  63: { "motor": null, "name": "Open Hi Conga" },
  64: { "motor": null, "name": "Low Conga" },
  65: { "motor": null, "name": "High Timbale" },
  66: { "motor": null, "name": "Low Timbale" },
  67: { "motor": null, "name": "High Agogo" },
  68: { "motor": null, "name": "Low Agogo" },
  69: { "motor": null, "name": "Cabasa" },
  70: { "motor": null, "name": "Maracas" },
  71: { "motor": null, "name": "Short Whistle" },
  72: { "motor": null, "name": "Long Whistle" },
  73: { "motor": null, "name": "Short Guiro" },
  74: { "motor": null, "name": "Long Guiro" },
  75: { "motor": null, "name": "Claves" },
  76: { "motor": null, "name": "Hi Wood Block" },
  77: { "motor": null, "name": "Low Wood Block" },
  78: { "motor": null, "name": "Mute Cuica" },
  79: { "motor": null, "name": "Open Cuica" },
  80: { "motor": null, "name": "Mute Triangle" },
  81: { "motor": null, "name": "Open Triangle" }

}

Motors.handleNoteOn = function(note, velocity) {
  if(!(35 < note && note < 81)) return;
  if(_.isNull(Motors.noteToMotorMapping[note].motor)) return;

  _.each(Motors.noteToMotorMapping[note].motor, function(motor){
    motor(150, velocity);
  });  
  
  console.log("Playing Note: " + note + "   name: " + Motors.noteToMotorMapping[note].name);  
}

function shakeMotor(motor, duration, velocity){
  motor.start(velocity*1.5);

  board.wait(duration, function() {
    motor.stop();
  });
}



module.exports = Motors;