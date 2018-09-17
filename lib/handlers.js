/* Relative imports */
const Fields = require('./fields')
const UserHandler = require('./user.handler')

/* Define the handlers for the urls */
const Handlers = {
  hello: helloFn,
  users: usersFn,
  ping: pingFn,
  notFound: notFoundFn,
}

module.exports = Handlers


////////////////////

function helloFn(_, reply) {
  return reply(200, { msg: 'Hello world!' })
}

function usersFn(data, reply) {
  const methods = ['get', 'post', 'put', 'delete']
  return methods.indexOf(data.method) > -1
    ? UserHandler[data.method](data, reply)
    : reply(405)
}

function pingFn(_, reply) {
  return reply(200)
}

function notFoundFn(_, reply) {
  return reply(404)
}