// Description
//   A Hubot script to control the party-play
//
// Configuration:
//   HUBOT_PARTY_PLAY_BASE_URL
//
// Commands:
//   hubot party-play <url> - play url
//   hubot party-play skip - skip current track
//   hubot party-play list - list tracks
//
// Author:
//   bouzuya <m@bouzuya.net>
//
var PartyPlayClient, config, parseConfig, request;

request = require('request-b');

parseConfig = require('hubot-config');

config = parseConfig('party-play', {
  baseUrl: null
});

PartyPlayClient = (function() {
  function PartyPlayClient(_at_baseUrl) {
    this.baseUrl = _at_baseUrl;
  }

  PartyPlayClient.prototype.add = function(url) {
    return request({
      method: 'GET',
      url: this.baseUrl + '/songs/add_url',
      qs: {
        url: url
      }
    }).then(function(r) {
      var json;
      json = JSON.parse(r.body);
      return json.status === 'ok';
    });
  };

  PartyPlayClient.prototype.list = function() {
    return request({
      method: 'GET',
      url: this.baseUrl + '/songs/index.json'
    }).then(function(r) {
      var json;
      json = JSON.parse(r.body);
      return json.next;
    });
  };

  PartyPlayClient.prototype.skip = function() {
    return request({
      method: 'POST',
      url: this.baseUrl + '/songs/skip'
    }).then(function(r) {
      var json;
      json = JSON.parse(r.body);
      return json.status === 'ok';
    });
  };

  return PartyPlayClient;

})();

module.exports = function(robot) {
  var newClient;
  newClient = function() {
    return new PartyPlayClient(config.baseUrl);
  };
  robot.respond(/p(?:arty-)?p(?:lay)?\s+(https:\/\/.+)/, function(res) {
    var youtubeUrl;
    youtubeUrl = res.match[1];
    return newClient().add(youtubeUrl).then(function(status) {
      return res.send(status);
    });
  });
  robot.respond(/p(?:arty-)?p(?:lay)?\s+skip/, function(res) {
    return newClient().skip().then(function(status) {
      return res.send(status);
    });
  });
  return robot.respond(/p(?:arty-)?p(?:lay)?\s+list/, function(res) {
    return newClient().list().then(function(tracks) {
      var messages;
      messages = tracks.map(function(i) {
        return i.artist + " - " + i.title + "\n" + i.artwork;
      });
      return res.send(messages.join('\n'));
    });
  });
};
