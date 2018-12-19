/* Relative imports */
const Data = require('./data')
const Helpers = require('./helpers')
const Fields = require('./fields')

const TokenHandler = {
  verifyToken: verifyTokenFn,
  get: getFn,
  post: postFn,
  put: putFn,
  delete: deleteFn,
}

module.exports = TokenHandler


////////////////////


const createToken = (id, token, fn) => Data.create('tokens', id, token, fn)
const readToken = (id, fn) => Data.read('tokens', id, fn)
const updateToken = (id, token, fn) => Data.update('tokens', id, token, fn)
const deleteToken = (id, fn) => Data.delete('tokens', id, fn)

// @TODO: move this to settings
const TOKEN_EXPIRATION_TIME = 1000 * 60 * 60

const ERRORS = {
  MISSING_REQUIRED_FIELDS: { 'Error': 'Missing required fields' },
  PASSWORD_HASH_FAILED: {'Error': 'Couldn\'t hash the password'},
  PASSWORD_DONT_MATCH: {'Error': 'Password doesn\'t match'},

  // @TODO: import this from elsewhere
  USER_NOT_FOUND: {'Error': 'The specified user doesn\'t exist'},

  CREATE_TOKEN_FAILED: {'Error': 'Couldn\'t create the new token'},
  READ_TOKEN_FAILED: {'Error': 'The specified token doesn\'t exist'},
  UPDATE_TOKEN_FAILED: {'Error': 'Couldn\'t extend the token'},
  DELETE_TOKEN_FAILED: {'Error': 'Couldn\'t delete the token'},
  TOKEN_EXPIRED: {'Error': 'The token has expired, it can\'t be extended'},
}


/**
 * Verifies if the given token id corresponds to the given user
 * @param  {string} tokenId
 * @param  {string} phone
 * @param  {function} fn
 * @return {bool}
 */
function verifyTokenFn(tokenId, phone, fn) {
  // Check that the token matches the given user one and not expired
  const tokenRetrievedFn = (readError, token) => !readError
    ? fn(token.phone === phone && token.expires > Date.now())
    : fn(false)

  // Lookup the token
  return (tokenId && phone)
    ? readToken(tokenId, tokenRetrievedFn)
    : fn(false)
}


/**
 * Handles GET method API calls to tokens endpoint
 * Required data: id
 * Optional data: none
 * @TODO only let an auth user access their object.
 * Don't let the user access other objects
 * getFn a => f => b
 */
function getFn(data, reply) {
  const tokenId = Fields.
    CharField(data.queryStrObject.id)(str => str.length === 20)

  const tokenRetrievedFn = (readError, token) => !readError
    ? reply(200, token)
    : reply(404)

  return tokenId
    ? readToken(tokenId, tokenRetrievedFn)
    : reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
}


/**
 * Handles POST method API calls to tokens endpoint
 * Required data: phone, password
 * Optional data: none
 * postFn a => f => b
*/
function postFn(data, reply){
  // Check that all required fields are filled out
  const phone = Fields.CharField(data.payload.phone)(str => str.length === 10)
  const password = Fields.CharField(data.payload.password)(s => s.length > 0)

  const tokenCreatedFn = createdToken => createErr => createErr
    ? reply(500, ERRORS.CREATE_TOKEN_FAILED)
    : reply(200, createdToken)

  // Creates a token linked to the given phone number
  // and returns an object response if it has been created
  // successfully or not
  const createTokenForUser = (phone) => {
    const tokenId = Helpers.createRandomString(20)
    const token = {
      id: tokenId,
      phone,
      expires: Date.now() + TOKEN_EXPIRATION_TIME,
    }
    return createToken(tokenId, token, tokenCreatedFn(token))
  }
  // Hash the password and compare it to the user's password
  // If the hashedPassword is valid, create a new token
  const checkPassword = (user) => {
    const hashedPassword = Helpers.hash(password)
      || reply(500, ERRORS.PASSWORD_HASH_FAILED)
    return (hashedPassword === user.hashedPassword)
      ? createTokenForUser(phone)
      : reply(400, ERRORS.PASSWORD_DONT_MATCH)
  }

  const userRetrievedFn = (readErr, user) => !readErr
    ? checkPassword(user)
    : reply(400, ERRORS.USER_NOT_FOUND)

  return (phone && password)
    ? Data.read('users', phone, userRetrievedFn)
    : reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
}


/**
 * Handles PUT method API calls to tokens endpoint
 * Required data: id, extend
 * Optional data: none
 * Don't let the user access other objects
 * postFn a => f => b
 */
function putFn(data, reply){
  const tokenId = Fields.CharField(data.payload.id)(str => str.length === 20)
  const extend = Fields.BoolField(data.payload.extend)(a => a)

  // Extend the tokens expiration time
  const extendToken = oldToken => ({
    ...oldToken,
    expires: Date.now() + TOKEN_EXPIRATION_TIME,
  })

  const replyBasedOnToken = token => updateErr => !updateErr
    ? reply(200, token)
    : reply(500, ERRORS.UPDATE_TOKEN_FAILED)

  // Check to make sure that the token is not already expired,
  // expired tokens can't be extended
  const checkTokenExpirationTime = token => token.expires > Date.now()
    ? [token]
      .map(extendToken)
      .map(t => updateToken(t.id, t, replyBasedOnToken(t)))
    : reply(500, ERRORS.TOKEN_EXPIRED)

  // If the token is found, check it's expiration time, otherwise return 404
  const tokenRetrievedFn = (readErr, token) => !readErr
    ? checkTokenExpirationTime(token)
    : reply(404, ERRORS.READ_TOKEN_FAILED)

  return (tokenId && extend)
    ? readToken(tokenId, tokenRetrievedFn)
    : reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
}


/**
 * Handles DELETE method API calls to tokens endpoint
 * Required data: id
 * Don't let the user access other objects
 * deleteFn a => f => b
 */
function deleteFn(data, reply) {
  const tokenId = Fields.CharField(data.queryStrObject.id)(str => str.length === 20)

  const tokenDeletedFn = deleteError => deleteError
    ? reply(500, ERRORS.DELETE_TOKEN_FAILED)
    : reply(200)

  const tokenRetrievedFn = (readErr, token) => !readErr
    ? deleteToken(token.id, tokenDeletedFn)
    : reply(400, ERRORS.NOT_FOUND)

  return tokenId
    ? readToken(tokenId, tokenRetrievedFn)
    : reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
}
