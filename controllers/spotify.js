var lame = require('lame'),
    deferred = require('deferred'),
    _ = require('underscore'),
    Speaker = require('speaker'),
    SpotifyWebAPI = require('spotify-web'),
    Spotify = {};

Spotify.initiate = function(){
  var isInitiated = new deferred();

  SpotifyWebAPI.login("pierrefree", "pierrefreepassword", _.bind(function (err, spotify) {
    if (err) throw err;

    Spotify.connection = spotify;
    Spotify.speaker = new Speaker();

    return isInitiated.resolve();
  },this));

  return isInitiated.promise();
}

Spotify.stop = function() {
  Spotify.speaker.close();
  Spotify.speaker = new Speaker();
  Spotify.isPlaying = false;
}    

Spotify.fetchTrack = function (uri) {
  var hasTrack = new deferred();

  if(Spotify.isPlaying) { Spotify.stop(); } 

  Spotify.connection.get(uri, _.bind(function (err, track) {
    if (err) throw err;

    return hasTrack.resolve(track);
  },this));

  return hasTrack.promise();
}

Spotify.playTrack = function (track) {
  track.play()
    .pipe(new lame.Decoder())
    .pipe(Spotify.speaker);
      
  console.log('Playing: %s - %s', track.artist[0].name, track.name);
  Spotify.isPlaying = true;
}


module.exports = Spotify;