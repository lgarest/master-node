const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config')
const fs = require('fs')
const path = require('path')


// Instantiating the HTTP server
http
  .createServer((request, response) => {
    unifiedServer(request, response)
  })
  // Starting the HTTPS server
  .listen(config.httpPort, () =>
    console.log(`The server is listening on port ${config.httpPort}`)
  )

// Instantiating the HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, '..', 'https/key.pem')),
  cert: fs.readFileSync(__dirname + '/../https/cert.pem')
}
https
  .createServer(httpsServerOptions, (request, response) => {
    unifiedServer(request, response)
  })
  // Starting the HTTPS server
  .listen(config.httpsPort, () =>
    console.log(`The server is listening on port ${config.httpsPort}`)
  )

// All the server logic for both http and https servers
const unifiedServer = function(request, response) {
  // Get the url and parse it
  const parseUrl = url.parse(request.url, true)

  // Get the trimmed path
  const path = parseUrl.pathname
    .replace(/^\/+|\/+$/g, '') // trim slashes at the end and the begining

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8')
  let payloadBuffer = ''

  request
    // triggered every time we receive data from the stream
    .on('data', payloadChunk =>
      payloadBuffer += decoder.write(payloadChunk))

    // triggered only at the end of the stream
    .on('end', () => {
      payloadBuffer += decoder.end()

      const parsedRequestData = {
        path,
        queryStrObject: parseUrl.query,
        method: request.method.toLowerCase(),
        headers: request.headers,
        payload: payloadBuffer
      }

      Router.routeRequest(parsedRequestData, response)
    })
}

const Views = {
  ping: (data, callback) => callback(200),
  notFound: (_, callback) => {
    callback(404)
  },
}

// Router obj
const Router = {
  urls: {}
}

Router.url = (url, view) =>
  Router.urls = {
    ...Router.urls,
    [url]: view,
  }


// Define our request router
Router.routeRequest = (requestObj, response) => {

  // Choose the view this request should go into.
  // If none, go to notFound view
  const view = Router.urls[requestObj.path] || Router.urls['404']

  // Construct the data object to send to the handler

  // Route the request to the View
  view(requestObj, (statusCode, data) => {

    const _statusCode = typeof(statusCode) == 'number'
      ? statusCode
      : 200

    const _data = typeof(data) == 'object'
      ? data
      : {}

    // Return the response
    response.setHeader('Content-Type', 'application/json')
    response.writeHead(_statusCode)
    response.end(JSON.stringify(_data))

    // Log the url request
    console.log(
      `> ${requestObj.method.toUpperCase()} ${requestObj.path} ${requestObj.payload}\n`,
      `${_statusCode} ${JSON.stringify(_data)}`)
  })
}

Router.url('ping', Views.ping)
Router.url('404', Views.notFound)

/*
  > curl\
    --header 'Content-Type: application/json'\
    --data '{ "enjoying": "the course" }'\
    localhost:3000/ping

  < Response 200 {"name":"log handler"}


  > curl\
    --header 'Content-Type: application/json'\
    --data '{ "enjoying": "the course" }'\
    localhost:3000/inexistent

  < Response 404 {}
 */