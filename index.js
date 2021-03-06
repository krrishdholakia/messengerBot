'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const FB = require('fb');
var fb = new FB.Facebook({version: 'v2.10', appId: '792651257580535', appSecret: '51bcf1c30a9487b1b54aa854d9118d20'});
app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
	res.send('1566454641')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'startup_Exchange_2018') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
FB.api('oauth/access_token', {
    client_id: '792651257580535',
    client_secret: '51bcf1c30a9487b1b54aa854d9118d20',
    grant_type: 'client_credentials'
}, function (res) {
	console.log(res);
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }
 
	var accessToken = res.access_token;
	FB.api(
	"/StartupExchange/events?time_filter=upcoming",
	{
		access_token: "792651257580535|pj83jueRZgWubbxWbpupmg5woKA"
	},
    function (response) {
		console.log(response);
      if (response && !response.error) {
        /* handle the result */
      }
    }
);
});


app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
      let event = req.body.entry[0].messaging[i]
      let sender = event.sender.id
	  if (event.message && event.message.text) {
		let text = event.message.text
		if (text === 'Upcoming Events') {
			FB.api(
				"/StartupExchange/events?time_filter=upcoming",
				{
					access_token: "792651257580535|pj83jueRZgWubbxWbpupmg5woKA"
				},
				function (response) {
					console.log(response);
				  if (response && !response.error) {
					/* handle the result */
				  }
				}
			);
			sendTextMessage(sender, "https://www.facebook.com/events/1750621848580640/")
			continue
		} else if (text == 'Get Started') {
			sendGenericMessage(sender)
		}
		sendTextMessage(sender, "Hi! type 'Get Started' to see more information.")
	  }
	  if (event.postback) {
		let text = event.postback.title
		if (text === 'Upcoming Events') {
			sendTextMessage(sender, "https://www.facebook.com/events/1750621848580640/")
			continue
		}
		sendGenericMessage(sender)
		continue
	  }
    }
    res.sendStatus(200)
  })

const token = "EAALQ6YCjiZCcBAANMTQfp3UG6A7ZANLtoBsjKbesDPoG0XvSOFJObgvQrAkuZAm6YZA1qwpBJXIonK6jznb48udC7Wl8SuHAdlhqHAayGoMl76vAf4U9HfhUyOrnnXcukDBpSFO1eapHxdK5ZCVsnvtrGuF8UYULmnQqZC3EhZBZBvlBuSOVZC4Yy"

function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
		json: {
		    recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
		    console.log('Error sending messages: ', error)
		} else if (response.body.error) {
		    console.log('Error: ', response.body.error)
	    }
    })
}

function sendGenericMessage(sender) {
    let messageData = {
	    "attachment": {
		    "type": "template",
		    "payload": {
				"template_type": "generic",
			    "elements": [{
					"title": "Discover",
				    "image_url": "https://pbs.twimg.com/profile_images/760579437519921152/xD0enLRb.jpg",
				    "buttons": [{
					    "type": "web_url",
					    "url": "http://www.startup.exchange/resources.html",
					    "title": "How to Start a Startup"
				    }, {
					    "type": "postback",
					    "title": "Upcoming Events",
					    "payload": "Payload for first element in a generic bubble",
				    }],
			    }]
		    }
	    }
    }
    request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token:token},
	    method: 'POST',
	    json: {
		    recipient: {id:sender},
		    message: messageData,
	    }
    }, function(error, response, body) {
	    if (error) {
		    console.log('Error sending messages: ', error)
	    } else if (response.body.error) {
		    console.log('Error: ', response.body.error)
	    }
    })
}
