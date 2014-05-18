/**
 * @depend /third-party/jquery.js
 * @depend /third-party/underscore.js
 **/


$(function(){

  var spotiftyWebAPI = 'http://ws.spotify.com/search/1/track.json?q=';
  //Find all buttons with data-play attribute

  $('[data-play-song]').click(function (event){

    var SpotifyURI = $(event.currentTarget).addClass('is-playing').data('play-song');

    $.ajax({
      type: "POST",
      url: "/play-song",
      data: { URI: SpotifyURI }
    }).done(function(data){
      $('[data-play-song]').addClass('disabled').removeClass('is-playing');
      $(event.currentTarget).addClass('is-playing');

      $('h2.title').text(data.artist + ' - ' + data.track + ' is playing ...');
      
    });
  });


  $('#query').keyup(function(event) {
    var spotifyQuery = $(event.currentTarget).val();

    $.get(spotiftyWebAPI+spotifyQuery).done(function(data){
      $('#results').empty();
      for(var i = 0; i < 10; i++){

        var templateData = {
          artist : data.tracks[i].artists[0].name,
          track : data.tracks[i].name,
          URI : data.tracks[i].href
        };
        var html = _.template('<li data-play-song="<%= URI %>"><%= artist %> - <%= track %></li>', templateData);
        $('#results').append(html);
      }

      $('[data-play-song]').unbind().click(function (event){
        var SpotifyURI = $(event.currentTarget).addClass('is-playing').data('play-song');

        $.ajax({
          type: "POST",
          url: "/play-song",
          data: { URI: SpotifyURI }
        }).done(function(data){
          $('[data-play-song]').addClass('disabled').removeClass('is-playing');
          $(event.currentTarget).addClass('is-playing');

          $('h2.title').text(data.artist + ' - ' + data.track + ' is playing ...');
          
        });
      });

    });
  });
});