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

// Export the router
module.exports = Router