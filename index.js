/* Node core imports */
const http = require('http')
const https = require('https')
const url = require('url')
const StringDecoder = require('string_decoder').StringDecoder
const fs = require('fs')
const path = require('path')

/* Relative imports */
const Config = require('./lib/config')
const Router = require('./lib/router')
const Handlers = require('./lib/handlers')
const Helpers = require('./lib/helpers')


// Instantiating the HTTP server
http
  .createServer(unifiedServer) // Pointfree notation
  // Starting the HTTPS server
  .listen(Config.httpPort, () =>
    console.log(`The server is listening on port ${Config.httpPort}`)
  )


// Instantiating the HTTPS server with the SSL certificate
const httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, 'https/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'https/cert.pem'))
}
https
  .createServer(httpsServerOptions, unifiedServer) // Pointfree notation
  // Starting the HTTPS server
  .listen(Config.httpsPort, () =>
    console.log(`The server is listening on port ${Config.httpsPort}`)
  )


// All the server logic for both http and https servers
function unifiedServer(request, response) {
  // Get the url and parse it
  const parseUrl = url.parse(request.url, true)

  // Get the trimmed path
  const path = parseUrl.pathname
    .replace(/^\/+|\/+$/g, '') // Trim slashes at the end and the begining

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8')
  let payloadBuffer = ''

  request
    // Triggered every time we receive data from the stream
    .on('data', payloadChunk => payloadBuffer += decoder.write(payloadChunk))

    // Triggered only at the end of the stream
    .on('end', () => {
      payloadBuffer += decoder.end()

      const parsedRequestData = {
        path,
        queryStrObject: parseUrl.query,
        method: request.method.toLowerCase(),
        headers: request.headers,
        payload: Helpers.parseJsonToObject(payloadBuffer)
      }

      // Route the request to the router
      Router.routeRequest(parsedRequestData, response)
    })
}

// Connect the urls with the views handling the request
Router.url('hello', Handlers.hello)
Router.url('ping', Handlers.ping)
Router.url('users', Handlers.users)
Router.url('404', Handlers.notFound)
