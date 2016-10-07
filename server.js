'use strict';

var http = require('http');



var HEADERS = {
	'Content-Type': 'application/json',
	'Access-Control-Allow-Origin': '*'
};

var PORT = 6699;

var VALIDATOR = '504b77fa22db2b0d192cadf2d2af398230578ab3';

var lastResponse;



function time() {
	var d = new Date();
	return d.toTimeString().split(' ')[0];
}

var server = http.createServer(function(req, res) {
	var body = [];
	res.writeHead(200, HEADERS);
	console.log(time(), req.method, req.url);

	if (req.url === '/fetch') {
		return res.end(lastResponse);
	}

	req.on('data', function(chunk) {
		body.push(chunk.toString());
	});

	req.on('end', function() {
		try {
			var o = body.join('');
			lastResponse = o;
		} catch (ex) {
			console.error(ex);
		}
		res.end(VALIDATOR);
	});
});
server.listen(PORT);
