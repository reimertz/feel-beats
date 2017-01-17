var consolidate = require('consolidate'),

    express = require('express'),
    bodyParser = require('body-parser')
    swig = require('swig'),
    _ = require('underscore'),
    
    deferred = require('deferred'),
    http = require('http-get'),
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    request = require('request'),

    Spotify = require('./controllers/spotify'),

    //
    AudioPlayer = require('./controllers/midi-audio'),
    MidiFetch = require('./controllers/midi-fetch'),
    MidiFile = require('./controllers/midi-file'),
    Replayer = require('./controllers/midi-replayer'),
    Stream = require('./controllers/midi-stream'),
    Synth = require('./controllers/midi-synth'),

    Motors = require('./controllers/motors'),
    app = express(),
    port = process.env.PORT || 3000;

    app.locals.templateMap = {
      'home': 'desktop/home'
    };

app.use('/css', express.static(__dirname + '/build/css'));
app.use('/js', express.static(__dirname + '/build/js'));
app.use('/img', express.static(__dirname + '/src/img'));
app.use('/fonts', express.static(__dirname + '/src/fonts'));
app.use(bodyParser());
app.engine('html', consolidate.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/build/html');
swig.setDefaults({ cache: false });


function prepMidiFile(data){
  console.log("Parsing MIDI file ...");
  var midiFile = {}, t = data || "", ff = [], mx = t.length, scc= String.fromCharCode;

  for (var z = 0; z < mx; z++) {
    ff[z] = scc(t.charCodeAt(z) & 255);
  }  

  return ff.join("");
}


app.post('/play-song', function (req, res) {

  Spotify.fetchTrack(req.body.URI)
    .then(function(track){
      var queryString = track.artist[0].name+ ' - ' + track.name;
      console.log('Fetched : %s - %s', track.artist[0].name, track.name);
      Replayer.finished = true;
      MidiFetch.query(queryString).done(function(downloadLink){
        console.log("Done! Got MIDI Download Link : " + downloadLink);

        //'https://github.com/reimertz/feel-beats/raw/master/test.mid'
        request({url:downloadLink, encoding:'binary'}, function (error, response, body) {
          console.log("Downloading MIDI file ...");
           /* munge response into a binary string */
    
            midiFile = MidiFile(prepMidiFile(body));
            replayer = Replayer(midiFile, 4410, Motors);
            
            Spotify.playTrack(track);

            res.writeHeader(200, {"Content-Type": "application/json"});  
            res.write(JSON.stringify({artist:track.artist[0].name, track:track.name}));
            res.end();
        });    
      });
    });
});


app.get('/:route?', function (req, res) {
  res.render('desktop/home', { title: req.params.route, cache:false });
});

console.log('Initiating Arduino and Spotify Connections...');
  Motors.initiate().then(function(){
    console.log('Arduino Connection Initiated!');
    Spotify.initiate().then(function(){
      console.log('Spotify Connection Initiated!');

      app.listen(port);
      console.log('Running buildstrap demo server on port ' + port);
  })  
});


