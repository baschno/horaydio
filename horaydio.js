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
	client.sendCommand(cmd("status", []), defaultCB);
	client.sendCommand(cmd("currentsong", []), defaultCB);
});

var stdin = process.stdin;


stdin.setRawMode(true);
stdin.setEncoding('utf-8');

stdin.on('data', function (key) {
	if (key === '\u0003') {
		client.sendCommand(cmd("stop", []), defaultCB);
		process.exit();
	}

  if (key === 'l') {
		client.sendCommand(cmd("clear", []), defaultCB);
		client.sendCommand(cmd("load", ["radio"]), defaultCB);
	}
  if (key === 'p') {
		client.sendCommand(cmd("play", [1]), defaultCB);
	}
  if (key === 'n') {
		client.sendCommand(cmd("next", []), defaultCB);
	}
	process.stdout.write(key);
});


var defaultCB = function(err, msg) {
	if (err) throw err;

	console.log(msg);
}
