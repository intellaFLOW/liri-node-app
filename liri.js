var tKeys = require("./keys.js");
var twitter = require ("twitter");
var fs = require("fs");
var Spotify = require ("node-spotify-api");
var spotify = new Spotify({
  id: '9b36ff8aea634d23858e5eb560a4cbfc',
  secret: '9fcecc5d3f8e4854acfd822d0cd9de0e'
});
var request = require ("request");
var inquirer = require("inquirer");
var keyOMDB = "40e9cece";
var client = new twitter({
    consumer_key: tKeys.consumer_key,
    consumer_secret: tKeys.consumer_secret,
    access_token_key: tKeys.access_token_key,
    access_token_secret: tKeys.access_token_secret
});
// Get Tweets Method
function getTweets() {
	// tell it which data we want
	var data = {screen_name: 'UCB_Flow', count: 20};
	//get data
	client.get('statuses/user_timeline', data, function(err, tweets, response) {
		// console.log if err
		if (err) {
        console.log('Error occurred: ' + err);
        return;
    // else if successful request, console.log tweet and time
    } else if (!err) {
	  	tweets.forEach(function(tweet) {
	  		console.log('Tweet: ' + tweet.text + '\nTime Tweeted: ' + tweet.created_at);
	  	});
	  }
	});
}
// Search Spotify Method
function findSong(song) {
	spotify.search({type: 'track', query: song.search}, function(err, data) {
			// console.log if err
	    if (err) {
	        console.log(err);
	        return;
	    // get data
	    } else {
	    	// set tracks to JSON before parse
		    var track = data.tracks.items[0];
		    // Seperate Lines and Log data to console
		    var logSong = 'Artist: ' + track.artists[0].name +
		    	'\nSong name: ' + track.name +
		    	'\nAlbum: ' + track.album.name +
		    	'\nSnippet Here: ' + track.preview_url;
		    console.log(logSong);
		}
	});
}
// Search OMDB Method
function findMovie(movie) {
	// Set chooseMovie to movie, replace spaces with '+'
	var chooseMovie = movie.search.replace(/ /g,'+');
	// request movie from OMDB API
	request('http://www.omdbapi.com/?t='+ chooseMovie +'&y=&json=&apikey='+ keyOMDB, function(err, response, body) {
		// Log any errors
		if (err) {
        console.log(err);
        return;
    // if the request is successful
    } else if (!err && response.statusCode === 200) {
	    // console.logs movie info
	    var logOMDB = 'Title: ' + JSON.parse(body).Title +
		    '\nYear: ' + JSON.parse(body).Year +
		    '\nIMDB Rating: ' + JSON.parse(body).imdbRating +
		    '\nMade In: ' + JSON.parse(body).Country +
		    '\nLanguage: ' + JSON.parse(body).Language +
		    '\nPlot: ' + JSON.parse(body).Plot +
		    '\nNoteable Actors: ' + JSON.parse(body).Actors +
		    '\nRotten Tomatoes Rating: ' + JSON.parse(body).tomatoRating +
		    '\nRotten Tomatoes Link: ' + JSON.parse(body).tomatoURL;
		console.log(logOMDB);
	  }
	});
}

// LIRI's Brain
function insideLIRI(user) {
	if (user.choice === 'spotify-this-song') {
		findSong(user);
	} else if (user.choice === 'movie-this') {
		findMovie(user);
	} else if (user.choice === 'my-tweets') {
		getTweets();
	} else {
		// LIRI uses the Spotify command pre-written in 'random.txt' if the user doesn't choose a different option
		fs.readFile('./random.txt', 'utf8', function(err, data) {
			// console.log if err
			if (err) {
				console.log(err);
			} else {
			  // otherwise output string seperated by commas
			  var output = data.split(',');
			  // set keys of importance to array
			  user.choice = output[0];
			  user.search = output[1];
			  // Recall
			  insideLIRI(user);
			}
		});
	}

	// Log searches to log.txt
	var logTxt = 'Unknown User Attempted Search: ' + user.choice + ' ' + user.search + '\n';

  fs.appendFile('log.txt', logTxt);
}

// LIRI's Mouth
inquirer.prompt([
	{
		type: 'input',
		message: 'What is your name?',
		name: 'name',
		default: 'User'
	},

	{
		type: 'list',
		message: 'What Can I Help You With Today?',
		choices: ['spotify-this-song', 'my-tweets', 'movie-this', 'do-what-it-says'],
		name: 'choice'
	},
	//if spotify selected
	{
		type: 'input',
		message: 'Which Song Are You Looking For?',
		name: 'search',
		default: 'In The End',
		when: function(answers){
	    return answers.choice === 'spotify-this-song';
	  }
	},
	// if OMDB selected
	{
		type: 'input',
		message: 'Which Movie Are You Looking For?',
		name: 'search',
		default: 'Finding Forrester',
		when: function(answers){
	    return answers.choice === 'movie-this';
	  }
	},
	//Confirms with user before running the command
	{
		type: 'confirm',
		message: 'Are you sure:',
		name: 'confirm',
		default: true

	}
]).then(function (user) {
	// If the user confirms...
	if (user.confirm){
		// Call the brains
		insideLIRI(user);

		// console.log message 
		console.log('LIRI is happy to help =)');

	// If the user does not confirm, then a message is provided and the program quits. 
	}

	else {
		// console.log message
		console.log('LIRI is having difficulty, please try again =(');

	}
// Catches any errors the promise would have otherwise swallowed and logs it
}).catch(function(err) {
	console.log(err);
});