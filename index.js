const http = require('http')
const url = require('url')



http
  .createServer((request, response) => {

    // 1. Get the url and parse it
    const parseUrl = url.parse(request.url, true)

    // 2. Get the path
    const path = parseUrl.pathname
    // trim slashes at the end and the begining
    const trimmedPath = path.replace(/^\/+|\/+$/g, '')

    // 3. Send the response
    response.end('hello world!\n')

    // 4. Log the url request
    console.log(`Request received on: '${trimmedPath}'`)
  })
  .listen(3000, () => {
    console.log('The server is listening on port 3000 now')
  })