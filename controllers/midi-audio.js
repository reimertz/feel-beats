var sampleRate = 44100; /* hard-coded in Flash player */

function AudioPlayer(generator, opts) {
	if (!opts) opts = {};
	var latency = opts.latency || 1;
	var checkInterval = latency * 100 /* in ms */
	
	var requestStop = false;
	
		var buffer = []; /* data generated but not yet written */
		var minBufferLength = latency * 2 * sampleRate; /* refill buffer when there are only this many elements remaining */
		var bufferFillLength = Math.floor(latency * sampleRate);
		
		function checkBuffer() {
			
			if (buffer.length) {
				var written = buffer;
				buffer = buffer.slice(written);
			}
			if (buffer.length < minBufferLength && !generator.finished) {
				buffer = buffer.concat(generator.generate(bufferFillLength));
			}
			if (!requestStop && (!generator.finished || buffer.length)) {
				setTimeout(checkBuffer, checkInterval);
			}
		}
		checkBuffer();
		
		return {
			'type': 'Firefox Audio',
			'stop': function() {
				requestStop = true;
			}
		}
}

module.exports = AudioPlayer;