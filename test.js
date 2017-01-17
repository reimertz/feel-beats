var fs = require('fs');
var midiConverter = require('midi-converter');
var midiSong = fs.readFileSync('test.mid', 'binary');
var jsonSong = midiConverter.midiToJson(midiSong);
fs.writeFileSync('test.json', JSON.stringify(jsonSong));