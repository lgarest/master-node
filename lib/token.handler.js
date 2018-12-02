/* Relative imports */
const Data = require('./data')
const Helpers = require('./helpers')
const Fields = require('./fields')

const TokenHandler = {
  get: getFn,
  post: postFn,
  put: putFn,
  delete: deleteFn,
  createToken,
}

module.exports = TokenHandler



////////////////////

// @TODO: move this to settings
const TOKEN_EXPIRATION_TIME = 1000 * 60 * 60

const ERRORS = {
  MISSING_REQUIRED_FIELDS: { 'Error': 'Missing required fields' },
  // MISSING_FIELDS_TO_UPDATE: {'Error': 'Missing fields to update'},
  // ACCOUNT_TAKEN: { 'Error': 'That account is already taken' },
  PASSWORD_HASH_FAILED: {'Error': 'Couldn\'t hash the password'},
  CREATE_TOKEN_FAILED: {'Error': 'Couldn\'t create the new token'},
  // UPDATE_USER_FAILED: {'Error': 'Couldn\'t modify the user'},
  // DELETE_USER_FAILED: {'Error': 'Couldn\'t delete the user'},
  NOT_FOUND: {'Error': 'The specified user doesn\'t exist'},

  UNDER_CONSTRUCTION: {'Error': 'endpoint not implemented yet'},
  PASSWORD_DONT_MATCH: {'Error': 'Password doesn\'t match'}
}


/**
 * Handles GET method API calls to tokens endpoint
 * Required data: id
 * Optional data: none
 * @todo only let an auth user access their object.
 * Don't let the user access other objects
 * getFn a => f => b
 */
function getFn(data, reply) {
  const tokenId = Fields.
    CharField(data.queryStrObject.id)(str => str.length === 20)

  const tokenRetrievedFn = (readError, token) =>
    (!readError && token) ? reply(200, token) : reply(404)

  return tokenId
    ? Data.read('tokens', tokenId, tokenRetrievedFn)
    : reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
}

// Creates a token linked to the given phone number
// and returns an object response if it has been created
// successfully or not
function createToken(phone, reply){
  const tokenId = Helpers.createRandomString(20)
  const token = {
    id: tokenId,
    phone,
    expires: Date.now() + TOKEN_EXPIRATION_TIME,  // Expiration time 1 hour
  }
  const tokenCreatedFn = createdToken => createErr => createErr
    ? reply(500, ERRORS.CREATE_TOKEN_FAILED)
    : reply(200, createdToken)

  // Store the token
  return Data.create('tokens', tokenId, token, tokenCreatedFn(token))

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

  // Hash the password and compare it to the user's password
  // If the hashedPassword is valid, create a new token
  const userFound = (user) => {
    const hashedPassword = Helpers.hash(password)
      || reply(500, ERRORS.PASSWORD_HASH_FAILED)
    return (hashedPassword === user.hashedPassword)
      ? createToken(phone, reply)
      : reply(400, ERRORS.PASSWORD_DONT_MATCH)
  }

  const userRetrievedFn = (userNotFound, user) =>
    (!userNotFound && user) ? userFound(user) : reply(400, ERRORS.NOT_FOUND)

  return (!phone || !password)
    ? reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
    : Data.read('users', phone, userRetrievedFn)
}


/**
 * Handles PUT method API calls to tokens endpoint
 * Required data: id, extend
 * Optional data: none
 * @todo only let an auth user update their object.
 * Don't let the user access other objects
 * postFn a => f => b
 */
function putFn(data, reply){
  // // Validate the payload
  // const firstName = Fields.CharField(data.payload.firstName)(notEmptyStr)
  // const lastName = Fields.CharField(data.payload.lastName)(notEmptyStr)
  // const phone = Fields.CharField(data.payload.phone)(str => str.length === 10)
  // const password = Fields.CharField(data.payload.password)(notEmptyStr)

  // const userRetrievedFn = (readError, user) => {
  //   const updateUser = oldUser => ({
  //     ...oldUser,
  //     firstName: firstName || oldUser.firstName,
  //     lastName: lastName || oldUser.lastName,
  //     password: (password && Helpers.hash(password)) || oldUser.password,
  //   })

  //   const userUpdatedFn = updatedUser => updateErr => !updateErr
  //     ? reply(200, secureUser(updatedUser))
  //     : reply(500, ERRORS.UPDATE_USER_FAILED)

  //   const updatedUser = updateUser(user)

  //   return (!readError && user)
  //     ? Data.update('users', phone, updatedUser, userUpdatedFn(updatedUser))
  //     : reply(400, ERRORS.NOT_FOUND)
  // }

  // return !phone
  //   ? reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
  //   : (!firstName && !lastName && !password)
  //     ? reply(400, ERRORS.MISSING_FIELDS_TO_UPDATE)
  //     : Data.read('tokens', phone, userRetrievedFn)
  return reply(400, ERRORS.UNDER_CONSTRUCTION)
}


/**
 * Handles DELETE method API calls to tokens endpoint
 * Required data: phone
 * @todo only let an auth user delete their object.
 * Don't let the user access other objects
 * @todo cleanup any other data files asociated with this user
 * deleteFn a => f => b
 */
function deleteFn(data, reply) {
  // const phone = Fields.
  //   CharField(data.queryStrObject.phone)(str => str.length === 10)

  // const userDeletedFn = deleteError => deleteError
  //   ? reply(500, ERRORS.DELETE_USER_FAILED)
  //   : reply(200)

  // const userRetrievedFn = (readError, user) => (!readError && user)
  //   ? Data.delete('tokens', phone, userDeletedFn)
  //   : reply(400, ERRORS.NOT_FOUND)

  // return phone
  //   ? Data.read('tokens', phone, userRetrievedFn)
  //   : reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
  return reply(400, ERRORS.UNDER_CONSTRUCTION)

}
