/* Relative imports */
const Data = require('./data')
const Helpers = require('./helpers')
const Fields = require('./fields')
const verifyToken = require('./token.handler').verifyToken


const UserHandler = {
  get: isAuthenticated(getFn),
  post: postFn,
  put: isAuthenticated(putFn),
  delete: isAuthenticated(deleteFn),
}

module.exports = UserHandler


////////////////////


const ERRORS = {
  MISSING_REQUIRED_FIELDS: { 'Error': 'Missing required fields' },
  MISSING_TOKEN: { 'Error': 'Missing or invalid token' },
  MISSING_FIELDS_TO_UPDATE: {'Error': 'Missing or invalid fields to update'},
  ACCOUNT_TAKEN: { 'Error': 'That account is already taken' },
  PASSWORD_HASH_FAILED: {'Error': 'Couldn\'t hash the password'},
  CREATE_USER_FAILED: {'Error': 'Couldn\'t create the new user'},
  UPDATE_USER_FAILED: {'Error': 'Couldn\'t modify the user'},
  DELETE_USER_FAILED: {'Error': 'Couldn\'t delete the user'},
  NOT_FOUND: {'Error': 'The specified user doesn\'t exist'},

  UNDER_CONSTRUCTION: {'Error': 'endpoint not implemented yet'}
}


/**
 * Decorates the given fn to allow it only to be run if the user is
 * successfully authenticated
 * @param  {Function}
 */
function isAuthenticated(fn){
  return (data, reply) => {
    const tokenId = Fields
      .CharField(data.headers.token)(str => str.length === 20)
    const argsPhone = {
      get: data.queryStrObject.phone,
      delete: data.queryStrObject.phone,
      post: data.payload.phone,
      put: data.payload.phone,
    }[data.method]
    const phone = Fields.CharField(argsPhone)(str => str.length === 10)
    return verifyToken(tokenId, phone, tokenIsValid => tokenIsValid
      ? fn(data, reply)
      : reply(403, ERRORS.MISSING_TOKEN)
    )
  }
}


/**
 * Remove user sensitive data before returning it
 * secureUser a => b
 */
const secureUser = (insecureUser) => {
  // eslint-disable-next-line no-unused-vars
  const { hashedPassword, tosAgreement, ...user} = insecureUser
  return user
}

/**
 * Validates that the given string is not empty
 * notEmptyStr a => bool
 * @TODO  move this to validators or helpers files
 */
const notEmptyStr = str => str.length > 0


/**
 * Handles GET method API calls to users endpoint
 * Required data: phone
 * Optional data: none
 * Don't let the user access other objects
 * getFn a => f => b
 */
function getFn(data, reply) {

  const phone = Fields.
    CharField(data.queryStrObject.phone)(str => str.length === 10)

  const userRetrievedFn = (readError, user) =>
    (!readError && user) ? reply(200, secureUser(user)) : reply(404)

  return phone
    ? Data.read('users', phone, userRetrievedFn)
    : reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
}


/**
 * Handles POST method API calls to users endpoint
 * Required data: firstName, lastName, phone, password, tosAgreement
 * Optional data: none
 * postFn a => f => b
*/
function postFn(data, reply){
  // Check that all required fields are filled out
  const firstName = Fields.CharField(data.payload.firstName)(notEmptyStr)
  const lastName = Fields.CharField(data.payload.lastName)(notEmptyStr)
  const phone = Fields.CharField(data.payload.phone)(str => str.length === 10)
  const password = Fields.CharField(data.payload.password)(notEmptyStr)
  const tosAgreement = Fields.BoolField(data.payload.tosAgreement)(a => a)

  const userCreatedFn = createdUser => createErr => createErr
    ? reply(500, ERRORS.CREATE_USER_FAILED)
    : reply(200, secureUser(createdUser))

  const userRetrievedFn = userIsNotCreated => {
    // Hash the password
    const hashedPassword = Helpers.hash(password)
      || reply(500, ERRORS.PASSWORD_HASH_FAILED)
    const user = {
      firstName,
      lastName,
      phone,
      hashedPassword: hashedPassword,
      tosAgreement: true,
    }

    return userIsNotCreated
      ? Data.create('users', phone, user, userCreatedFn(user))
      : reply(400, ERRORS.ACCOUNT_TAKEN)
  }
  return (firstName && lastName && phone && password && tosAgreement)
    ? Data.read('users', phone, userRetrievedFn)
    : reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
}


/**
 * Handles PUT method API calls to users endpoint
 * Required data: phone
 * Optional data (min 1): firstName, lastName, phone, password, tosAgreement
 * @TODO only let an auth user update their object.
 * Don't let the user access other objects
 * postFn a => f => b
 */
function putFn(data, reply){
  // Validate the payload
  const firstName = Fields.CharField(data.payload.firstName)(notEmptyStr)
  const lastName = Fields.CharField(data.payload.lastName)(notEmptyStr)
  const phone = Fields.CharField(data.payload.phone)(str => str.length === 10)
  const password = Fields.CharField(data.payload.password)(notEmptyStr)

  const userRetrievedFn = (readError, user) => {
    const updateUser = oldUser => ({
      ...oldUser,
      firstName: firstName || oldUser.firstName,
      lastName: lastName || oldUser.lastName,
      password: (password && Helpers.hash(password)) || oldUser.password,
    })

    const userUpdatedFn = updatedUser => updateErr => !updateErr
      ? reply(200, secureUser(updatedUser))
      : reply(500, ERRORS.UPDATE_USER_FAILED)

    const updatedUser = updateUser(user)

    return (!readError && user)
      ? Data.update('users', phone, updatedUser, userUpdatedFn(updatedUser))
      : reply(400, ERRORS.NOT_FOUND)
  }

  return !phone
    ? reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
    : (!firstName && !lastName && !password)
      ? reply(400, ERRORS.MISSING_FIELDS_TO_UPDATE)
      : Data.read('users', phone, userRetrievedFn)
}


/**
 * Handles DELETE method API calls to users endpoint
 * Required data: phone
 * @TODO only let an auth user delete their object.
 * Don't let the user access other objects
 * @TODO cleanup any other data files asociated with this user
 * deleteFn a => f => b
 */
function deleteFn(data, reply) {
  const phone = Fields
    .CharField(data.queryStrObject.phone)(str => str.length === 10)

  const userDeletedFn = deleteError => !deleteError
    ? reply(200)
    : reply(500, ERRORS.DELETE_USER_FAILED)

  const userRetrievedFn = (readError, user) => (!readError && user)
    ? Data.delete('users', phone, userDeletedFn)
    : reply(400, ERRORS.NOT_FOUND)

  return phone
    ? Data.read('users', phone, userRetrievedFn)
    : reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
}
