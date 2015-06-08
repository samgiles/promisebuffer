var buffer = require('../index').buffer;
var bufferError = require('../index').bufferError;
var streamcat = require('streamcat');
var createReadStream = require('fs').createReadStream;
var assert = require('assert');

describe('buffer(stream)', function() {
	it("should buffer a stream and return the buffer in a Promise", function(done) {
		var stream = streamcat([new Buffer("Hello world!")]);

		buffer(stream).then(function(buffer) {
			assert.equal(buffer.toString(), "Hello world!");
			done();
		});
	});
	it("should buffer a chunked stream and return the buffer in a Promise", function(done) {
		var stream = streamcat([new Buffer("Hello "), new Buffer("world!")]);

		buffer(stream).then(function(buffer) {
			assert.equal(buffer.toString(), "Hello world!");
			done();
		});
	});

	it("should reject errors emitted on the stream in the Promise", function(done) {
		var stream = createReadStream('/dev/not/a/file');

		buffer(stream).then(function(buffer) {
			return false;
		}).catch(function(error) {
			assert.equal(error.code, "ENOENT");
			done();
		});
	});
});

describe("bufferError(stream)", function() {
	it('should buffer an error that occurs on a stream before any "error" event handlers have been attached', function(done) {
		var stream = createReadStream('/dev/not/a/file');

		var bufferedErrorStream = bufferError(stream);

		process.nextTick(function() {
			bufferedErrorStream.on('error', function(error) {
				assert.equal(error.code, "ENOENT");
				done();
			});
		});
	});
});

