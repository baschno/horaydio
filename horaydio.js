var mpd = require('mpd'),
cmd = mpd.cmd;

var MPR121 = require('./mpr121_include.js');

// setup sensor device id 0x5A and i2c-bus 1
var touchsensor = new MPR121(0x5A, 1);

var ar = [0,0,0,0,0,0,0,0,0,0,0,0];
var playing = false;
var initiialzed = false;

var TIMER_INTERVAL = 200;
var volume = 77;

var defaultCB = function(err, msg) {
	if (err) throw err;

	console.log(msg);
}

var keyToPin = {
									p:0, //playPause
									l:1, //load playlist
									k:9, // kill exit
									n:11, //next
									r:5, //reverse -> prev
									d:7, //down da volume
									u:8 // up da volume
							}
var client = mpd.connect({ port: 6600, host: 'localhost', });

client.on('ready', function() {
	console.log("ready");
});
client.on('system', function(name) {
	console.log("update", name);
});
client.on('system-player', function() {
	client.sendCommand(cmd("status", []), defaultCB);
	client.sendCommand(cmd("currentsong", []), defaultCB);
});


// initiialze sensor, on success start script
if (touchsensor.begin()) {
	// message how to quit
	console.log('Press Ctrl-C to quit.');

	// Interval for reading the sonsor
	setInterval(function() {
		// loop through pins
		for (var i = 0; i < 12; i++) {
			// push status into sensor
			switchCtrl(touchsensor.is_touched(i), i)
		}
	}, TIMER_INTERVAL);
};


function activateAction(pinNo) {
	switch (pinNo) {
		case 0:
			mpdPlayPause();
			break;
		case 1:
		  mpdInitialize();
			break;
		case 5:
			mpdPrev();
			break;
		case 7:
			mpdVolume(false);
			break;
		case 8:
			mpdVolume(true);
			break;
		case 11:
			mpdNext();
			break;
		default:
	}
}

var switchCtrl = function(touched, pinNo) {
	pinState = ar[pinNo];

	if (touched) {
		pinState++;

		if (pinState==1) {
			console.log('Touched '+pinNo);
			activateAction(pinNo);
		}
	} else {
		if (pinState>0)
			console.log("Released "+pinNo);
		pinState = 0;
	}
	ar[pinNo]=pinState;
}

function mpdPlayPause() {
	if (!initiialzed)
		mpdInitialize();
	if (playing)
		client.sendCommand(cmd("stop", []), defaultCB);
	else
		client.sendCommand(cmd("play", [1]), defaultCB);

	console.log("Playing: "+!playing);

	playing = !playing;
}

function mpdNext() {
	client.sendCommand(cmd("next", []), defaultCB);
	console.log("Next...");
}

function mpdPrev() {
	client.sendCommand(cmd("previous", []), defaultCB);
	console.log("Prev...");
}

function mpdStop() {
	client.sendCommand(cmd("stop", []), defaultCB);
}

function mpdInitialize() {
	client.sendCommand(cmd("clear", []), defaultCB);
	client.sendCommand(cmd("load", ["radio"]), defaultCB);
	client.sendCommand(cmd("repeat", [1]), defaultCB);
	client.sendCommand(cmd("crossfade", [4]), defaultCB);
}

function mpdVolume(up) {
	if (up && volume < 100)
	  volume++;
	if (!up && volume>0)
		volume--;

	client.sendCommand(cmd("setvol", [volume]), defaultCB);
	console.log("Set Volume: "+volume);

}

//handle keyboard control
var stdin = process.stdin;
stdin.setRawMode(true);
stdin.setEncoding('utf-8');

stdin.on('data', function (key) {
	if (key === '\u0003') {
		mpdStop();
		process.exit();
	}

	activateAction(keyToPin[key]);
	process.stdout.write(key);
});
