// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


//-------------------------------------------------------------//


// init Spotify API wrapper
var SpotifyWebApi = require('spotify-web-api-node');

// The API object we'll use to interact with the API
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.CLIENT_ID,
  clientSecret : process.env.CLIENT_SECRET
});

// Using the Client Credentials auth flow, authenticate our app
spotifyApi.clientCredentialsGrant()
  .then(function(data) {
  
    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  
  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err.message);
  });


//-------------------------------------------------------------//

// GET /track?query=xxxx
app.get('/track', function (request, response) {
  spotifyApi.searchTracks(request.query.query, { limit: 1 })
    .then((data) => {
      let name = data.body.tracks.items[0].name;
      let id = data.body.tracks.items[0].id;
    
      // Return track info {name: "Xxx Xxx", id: "xxxxxxxx"}
      response.send({name: name, id: id});
    }, (err) => console.error(err));
});

// GET /audio-analysis?id=xxxx
app.get('/audio-analysis', function (request, response) {
  spotifyApi.getAudioAnalysisForTrack(request.query.id)
    .then((data) => {
      // Return audio analysis object
      response.send(data.body);    
    }, (err) => console.error(err));
});


//-------------------------------------------------------------//


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
