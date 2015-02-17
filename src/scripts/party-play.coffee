# Description
#   A Hubot script to control the party-play
#
# Configuration:
#   HUBOT_PARTY_PLAY_BASE_URL
#
# Commands:
#   hubot party-play <url> - play url
#   hubot party-play skip - skip current track
#   hubot party-play list - list tracks
#
# Author:
#   bouzuya <m@bouzuya.net>
#
request = require 'request-b'
parseConfig = require 'hubot-config'

config = parseConfig 'party-play',
  baseUrl: null

class PartyPlayClient
  constructor: (@baseUrl) ->

  add: (url) ->
    request
      method: 'GET'
      url: @baseUrl + '/songs/add_url'
      qs: { url }
    .then (r) ->
      json = JSON.parse r.body
      json.status is 'ok'

  list: ->
    request
      method: 'GET'
      url: @baseUrl + '/songs/index.json'
    .then (r) ->
      json = JSON.parse r.body
      json.next

  skip: ->
    request
      method: 'POST'
      url: @baseUrl + '/songs/skip'
    .then (r) ->
      json = JSON.parse r.body
      json.status is 'ok'

module.exports = (robot) ->

  newClient = ->
    new PartyPlayClient(config.baseUrl)

  robot.respond /p(?:arty-)?p(?:lay)?\s+(https:\/\/.+)/, (res) ->
    youtubeUrl = res.match[1]
    newClient().add youtubeUrl
      .then (status) ->
        res.send status

  robot.respond /p(?:arty-)?p(?:lay)?\s+skip/, (res) ->
    newClient().skip()
      .then (status) ->
        res.send status

  robot.respond /p(?:arty-)?p(?:lay)?\s+list/, (res) ->
    newClient().list()
      .then (tracks) ->
        messages = tracks.map (i) ->
          """
          #{i.artist} - #{i.title}
          #{i.artwork}
          """
        res.send messages.join '\n'
