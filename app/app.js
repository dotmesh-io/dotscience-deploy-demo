'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const ecstatic = require('ecstatic')
const request = require('request')

const App = () => {
  
  const app = express()
  app.use(bodyParser.json())

  app.post('/model', (req, res, next) => {
    const {
      model_url,
      request_body,
    } = req.body
    request({
      method: 'POST',
      url: model_url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request_body),
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