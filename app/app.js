'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const ecstatic = require('ecstatic')
const request = require('request')

const requests = {}

for(let i=0; i<10; i++){
  requests[i] = require(`./images/req${i}.json`)
}

const App = () => {
  
  const app = express()
  app.use(bodyParser.json())

  app.post('/model', (req, res, next) => {
    const {
      model_url,
      numberTitle,
    } = req.body
    const requestBody = requests[numberTitle]
    request({
      method: 'POST',
      url: model_url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }, (err, response, body) => {
      if(err) {
        res.status(500)
        res.end(err.toString())
        return
      }
      res.status(response.statusCode)
      res.setHeader('Content-Type', response.headers['content-type'])
      res.end(body)
    })
  })

  app.use(ecstatic({
    root: `${__dirname}/www`,
  }))

  app.use((req, res, next) => {
    res.status(404)
    res.end(`url ${req.url} not found`)
  })

  app.use((err, req, res, next) => {
    res.status(500)
    res.json(err.toString())
  })

  return app
}

module.exports = App