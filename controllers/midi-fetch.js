
var deferred = require('deferred'),
    random_ua = require('random-ua'),
    request = deferred.promisify(require('request')),
    cheerio = require('cheerio'),
    _ = require('underscore'),
    startURL = 'http://www.free-midi.org/search/',
    endURL = '/pg1/',
    MidiFetch = {};;


function replaceSpaceWithHyphen(string) {
  return string.replace(/\s+/g, '-');
}

function searchForMidiSong(query){
      console.log('Searching for' + query + '....');
      var gotALink = new deferred(),
          encodedQuery = startURL + replaceSpaceWithHyphen(query) + endURL;
          

      request({url: encodedQuery, headers: {'User-Agent' : random_ua.generate()}})
        .done(function (body) {

          var detailPageLink = cheerio.load(body[1])('.tbul li a').first().attr('href');

          console.log('Found a Midi File ...');

        return gotALink.resolve(detailPageLink);

      }, function(error){
        return gotALink.reject(error);
      });

    return gotALink.promise();
}  


function getDownloadLinkFromDetailPage(detailPageURL){
      console.log('Fetching Midi Download Link ...');
      var hasDownloadLink = new deferred();

      request({url: detailPageURL, headers: {'User-Agent' : random_ua.generate()}})
        .done(function (body) {

          var downloadLink = cheerio.load(body[1])('#download a').first().attr('href');

        return hasDownloadLink.resolve(downloadLink);

      }, function(error){
        return hasDownloadLink.reject(error);
      });

    return hasDownloadLink.promise();  
}


MidiFetch.query = function (query){
  hasMidiLink = new deferred();

  console.log(query);

  searchForMidiSong(query)
    .then(function(detailPageLink){
      getDownloadLinkFromDetailPage (detailPageLink)
        .then(function(midiDownloadLink){
          return hasMidiLink.resolve(midiDownloadLink);
        }, function(error){
          return hasMidiLink.reject(error);
        })
    })

  return hasMidiLink.promise();
}


module.exports = MidiFetch;