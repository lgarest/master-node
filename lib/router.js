/* Router redirecting the requests to the specific handlers */
const Router = {
  urls: {}, // urls : handler function mapping
  url: urlFn,
  routeRequest: routeRequestFn,
}

module.exports = Router


////////////////////


/**
 * Registers the given url with the handler
 * @param  {str} url  to be routed
 * @param  {fn} handler  handling the request
 */
function urlFn(url, handler) {
  Router.urls = {
    ...Router.urls,
    [url]: handler,
  }
}

/**
 * Routes the request to the given path in the request obj
 * @param  {obj} request containing the request
 * @param  {obj} response   to be given back
 */
function routeRequestFn(request, response) {

  // Choose the handler this request should go into.
  // If none, go to notFound handler
  const handler = Router.urls[request.path] || Router.urls['404']

  // Route the request to the handler
  handler(request, (statusCode, data) => {

    const _statusCode = typeof(statusCode) == 'number' ? statusCode : 200

    const _data = typeof(data) == 'object' ? data : {}

    // Return the response
    response.setHeader('Content-Type', 'application/json')
    response.writeHead(_statusCode)
    response.end(JSON.stringify(_data))

    // Log the url request
    console.log(
      `> ${request.method.toUpperCase()} ${request.path} ${JSON.stringify(request.payload)}\n`,
      `${_statusCode} ${JSON.stringify(_data)}`)
  })
}