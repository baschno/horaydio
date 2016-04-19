var mpd = require('mpd'),
cmd = mpd.cmd

var client = mpd.connect({ port: 6600, host: 'localhost', });
client.on('ready', function() {
	console.log("ready");
});
client.on('system', function(name) {
	console.log("update", name);
});
client.on('system-player', function() {
	client.sendCommand(cmd("status", []), function(err, msg) {
		if (err) throw err;

		console.log(msg);
	});
});

var stdin = process.stdin;

function defaulCB(err, msg) {
	if (err) throw err;

	console.log(msg);
}

stdin.setRawMode(true);
stdin.setEncoding('utf-8');

stdin.on('data', function (key) {
	if (key === '\u0003') {
		client.sendCommand(cmd("stop", []), function(err, msg) {
			if (err) throw err;

			console.log(msg);
		});
		process.exit();
	}

  if (key === 'l') {
		client.sendCommand(cmd("load", ["radio"]), defaulCB(err, msg));
	}
  if (key === 'p') {
		client.sendCommand(cmd("play", [1]), function(err, msg) {
			if (err) throw err;

			console.log(msg);
		});
	}
  if (key === 'n') {
		client.sendCommand(cmd("next", []), function(err, msg) {
			if (err) throw err;

			console.log(msg);
		});
	}
	process.stdout.write(key);
});
