'use strict';

function bufferStreamError(stream) {
	var bufferedError = null;

	var originalStreamOn = stream.on.bind(stream);

	// Complex: Node's EventEmitter will fire and forget events - if there is
	// nothing listening then the event is forgotten.  In the case of 'error'
	// events, if there are no listeners then an exception is thrown inside
	// the emitter.  To avoid this and to give some time to attach error
	// handlers to the final composed stream, if an error occurs _before_ an
	// error handler has been attached it gets buffered.  Then, when the
	// appropriate event handler is attached, the event is fired and the
	// appropriate handler can pick the error up.
	//
	function bufferError(error) {
		bufferedError = error;
	}

	stream.once('error', bufferError);

	stream.on = function(ev, handler) {
		originalStreamOn(ev, handler);

		if (ev === 'error') {
			if (bufferedError !== null) {
				this.removeListener('error', bufferError);
				this.emit(ev, bufferedError);
				bufferedError = null;
			}

			stream.on = originalStreamOn;
		}
	}.bind(stream);

	return stream;
}

/**
 * Buffers a given stream into a Buffer.  Returns a Promise containing the
 * resulting Buffer.  If the stream errors the Promise is rejected with the
 * original stream error.
 */
function bufferStream(stream) {
	// We must buffer the error because we won't attach an event listener to
	// reject the promise 'onerror' until another run of the event loop, by which time the
	// error may have been thrown and uncaught.
	var streamToBuffer = bufferStreamError(stream);

	return new Promise(function(resolve, reject) {
		var dataBuffers = [];

		stream.on('error', reject);
		stream.on('data', function(data, enc) {
			dataBuffers.push(data);
		});
		stream.on('end', function() {
			resolve(Buffer.concat(dataBuffers));
		});
	});
}

module.exports = {
	bufferError: bufferStreamError,
	buffer:      bufferStream
}
