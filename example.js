/*
 * Example showing a simple loop reading the touch status every 0.1ms
 */


// get library
var MPR121 = require('./index.js');
var ar = [0,0,0,0,0,0,0,0,0,0,0,0];

// setup sensor device id 0x5A and i2c-bus 1
var touchsensor = new MPR121(0x5A, 1);

// initiialze sensor, on success start script
if (touchsensor.begin()) {
	// message how to quit
	console.log('Press Ctrl-C to quit.');

	// Interval for reading the sonsor
	setInterval(function() {
		// get touch values
		var t = touchsensor.touched();

		// loop through pins
		for (var i = 0; i < 12; i++) {
			pinState = ar[i];
			// push status into sensor
			if (touchsensor.is_touched(i)) {
				pinState++;
				if (pinState==1) {
					console.log('Touched '+i);
				}
				ar[i] = 1;
				// console.log(ar);
			} else {
				if (pinState>0)
					console.log("Released "+i);
				pinState = 0;
			}
			ar[i]=pinState;
		}
	}, 200);
};
