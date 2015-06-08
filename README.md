# Promise Stream Buffer

Utilities for Buffering streamed content into a Promise value.


## API

### `buffer(stream)`

Given a `stream` returns a `Promise` that will resolve with the Buffered
contents of to the Stream once it has been fully written (`end` event
emitted).

Example:

```JS
var buffer = require('promisebuffer');

buffer(require('fs').createReadStream('myfile')).then(function(buffer) {
	console.log(buffer.toString());
}).catch(function(error) {
	console.error(error.message);
});
```

### `bufferStreamError(stream)`

Given a stream buffer the first error that occurs until an event listener is
registered.  This allows you to attach event listeners in a different event
loop run.

Example:

```JS
var bufferError = require('promisebuffer').bufferError;

var stream = bufferError(require('fs').createReadStream('myfile'));

// Allows you to attach error handlers inside async sections without an error
// throwing an uncaught exception
var x = new Promise(function(resolve, reject) {
	stream.on('error', reject);
	/ * ... */
});
```

# License

MIT
