function Replayer(midiFile, sampleRate, motorController) {
	var trackStates = [];
	var beatsPerMinute = 120;
	var ticksPerBeat = midiFile.header.ticksPerBeat;
	var channelCount = 16;
	var finished = false;
	var motorController = motorController;

	
	for (var i = 0; i < midiFile.tracks.length; i++) {
		trackStates[i] = {
			'nextEventIndex': 0,
			'ticksToNextEvent': (
				midiFile.tracks[i].length ?
					midiFile.tracks[i][0].deltaTime :
					null
			)
		};
	}
	
	function Channel() {
		
		var generatorsByNote = {};
		//var currentProgram = PianoProgram;
		
		function noteOn(note, velocity) {
			motorController.handleNoteOn(note, velocity);
		}
		function noteOff(note, velocity) {
			
		}
		function setProgram(programNumber) {
		}
		
		return {
			'noteOn': noteOn,
			'noteOff': noteOff,
			'setProgram': setProgram
		}
	}
	
	var channels = [];
	for (var i = 0; i < channelCount; i++) {
		channels[i] = Channel();
	}
	
	var nextEventInfo;
	var samplesToNextEvent = 0;
	
	function getNextEvent() {
		var ticksToNextEvent = null;
		var nextEventTrack = null;
		var nextEventIndex = null;
		
		for (var i = 0; i < trackStates.length; i++) {
			if (
				trackStates[i].ticksToNextEvent != null
				&& (ticksToNextEvent == null || trackStates[i].ticksToNextEvent < ticksToNextEvent)
			) {
				ticksToNextEvent = trackStates[i].ticksToNextEvent;
				nextEventTrack = i;
				nextEventIndex = trackStates[i].nextEventIndex;
			}
		}
		if (nextEventTrack != null) {
			/* consume event from that track */
			var nextEvent = midiFile.tracks[nextEventTrack][nextEventIndex];
			if (midiFile.tracks[nextEventTrack][nextEventIndex + 1]) {
				trackStates[nextEventTrack].ticksToNextEvent += midiFile.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
			} else {
				trackStates[nextEventTrack].ticksToNextEvent = null;
			}
			trackStates[nextEventTrack].nextEventIndex += 1;
			/* advance timings on all tracks by ticksToNextEvent */
			for (var i = 0; i < trackStates.length; i++) {
				if (trackStates[i].ticksToNextEvent != null) {
					trackStates[i].ticksToNextEvent -= ticksToNextEvent
				}
			}
			nextEventInfo = {
				'ticksToEvent': ticksToNextEvent,
				'event': nextEvent,
				'track': nextEventTrack
			}
			var beatsToNextEvent = ticksToNextEvent / ticksPerBeat;
			var secondsToNextEvent = beatsToNextEvent / (beatsPerMinute / 60);
			samplesToNextEvent += secondsToNextEvent * sampleRate;

			if(!finished){
			setTimeout(function(){
				playSong();
			},  secondsToNextEvent * sampleRate);
		}
		} else {
			nextEventInfo = null;
			samplesToNextEvent = null;
			finished = true;
		}
	}
	
	getNextEvent();

	function playSong() {
		handleEvent();
		getNextEvent();	
	}
				
	function handleEvent() {
		var event = nextEventInfo.event;
		switch (event.type) {
			case 'meta':
				switch (event.subtype) {
					case 'setTempo':
						beatsPerMinute = 60000000 / event.microsecondsPerBeat
				}
				break;
			case 'channel':
				switch (event.subtype) {
					case 'noteOn':
						channels[event.channel].noteOn(event.noteNumber, event.velocity);
						break;
					case 'noteOff':
						//channels[event.channel].noteOff(event.noteNumber, event.velocity);
						break;
					case 'programChange':
						channels[event.channel].setProgram(event.programNumber);

						console.log("Setting up Channel #" + event.programNumber)
						break;
				}
				break;
		}
	}
	
	/*function replay(audio) {
		audio.write(generate(44100));
		setTimeout(function() {replay(audio)}, 10);
	}*/
	


	playSong();
	console.log('Starting sending MIDI to Arduino...');

	var self = {
		'playSong': playSong,
		'finished': false
	}
	return self;
}

module.exports = Replayer;
