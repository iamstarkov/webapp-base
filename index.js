'use strict';
var Chan = require('./lib/utils').Chan;
var chan = new Chan();
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded());

app.post('/addMessage', function(req, res) {
  console.log(req.body);

  chan.getId().then(function(id) {
    var newId = ~~id;
    newId++;

    chan.addMessage(newId, 'media', req.body.text);
  });
  res.redirect('/');
});

app.get('/reset', function(req, res) {

  chan.setId(0);
  res.redirect('/');
});

app.get('/', function(req, res) {
  chan.getMessagesList().then(function(list) {
    var messages = list.map(function(msg) {
      return '#' + msg.id + '\n<br/>' + msg.media + ' :: ' + msg.text;
    });
    var form = [
      '<form action="/addMessage" method="post" enctype="application/x-www-form-urlencoded">',
      '<input name="text">',
      '<button type="submit">Add message</button>',
      '</form>',
      '<br/>',
      '<a href="/reset">Reset</a>',
    ].join('');
    res.send(messages.join('<br/><br/>\n\n') + form);
  });
});

app.listen(3000);
