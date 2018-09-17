/* Relative imports */
const Data = require('./data')
const Helpers = require('./helpers')
const Fields = require('./fields')


const UserHandler = {
  get: getFn,
  post: postFn,
  put: putFn,
  delete: deleteFn
}

module.exports = UserHandler


////////////////////


const ERRORS = {
  MISSING_REQUIRED_FIELDS: { 'Error': 'Missing required fields' },
  MISSING_FIELDS_TO_UPDATE: {'Error': 'Missing fields to update'},
  ACCOUNT_TAKEN: { 'Error': 'That account is already taken' },
  PASSWORD_HASH_FAILED: {'Error': 'Couldn\'t hash the password'},
  CREATE_USER_FAILED: {'Error': 'Couldn\'t create the new user'},
  UPDATE_USER_FAILED: {'Error': 'Couldn\'t modify the user'},
  DELETE_USER_FAILED: {'Error': 'Couldn\'t delete the user'},
  NOT_FOUND: {'Error': 'The specified user doesn\'t exist'},

  UNDER_CONSTRUCTION: {'Error': 'endpoint not implemented yet'}
}

/**
 * Remove user sensitive data before returning it
 * secureUser a => b
 */
const secureUser = (insecureUser) => {
  const { hashedPassword, tosAgreement, ...user} = insecureUser
  return user
}

/**
 * Validates that the given string is not empty
 * notEmptyStr a => bool
 * @todo  move this to validators or helpers files
 */
const notEmptyStr = str => str.length > 0


/**
 * Handles GET method API calls to users endpoint
 * Required data: phone
 * Optional data: none
 * @todo only let an auth user access their object.
 * Don't let the user access other objects
 * getFn a => f => b
 */
function getFn(data, reply) {
  const phone = Fields.CharField(data.queryStrObject.phone)
    (str => str.length === 10)

  const userRetrievedFn = (readError, user) =>
    (!readError && user) ? reply(200, secureUser(user)) : reply(404)

  return !phone
    ? reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
    : Data.read('users', phone, userRetrievedFn)
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

  if (!firstName || !lastName || !phone || !password || !tosAgreement)
    return reply(400, ERRORS.MISSING_REQUIRED_FIELDS)

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

  Data.read('users', phone, userRetrievedFn)
}


/**
 * Handles PUT method API calls to users endpoint
 * Required data: phone
 * Optional data (min 1): firstName, lastName, phone, password, tosAgreement
 * @todo only let an auth user update their object.
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
 * @todo only let an auth user delete their object.
 * Don't let the user access other objects
 * @todo cleanup any other data files asociated with this user
 * deleteFn a => f => b
 */
function deleteFn(data, reply) {
  const phone = Fields.CharField(data.queryStrObject.phone)
    (str => str.length === 10)

  const userDeletedFn = deleteError => deleteError
    ? reply(500, ERRORS.DELETE_USER_FAILED)
    : reply(200)

  const userRetrievedFn = (readError, user) => (!readError && user)
    ? Data.delete('users', phone, userDeletedFn)
    : reply(400, ERRORS.NOT_FOUND)

  return phone
    ? Data.read('users', phone, userRetrievedFn)
    : reply(400, ERRORS.MISSING_REQUIRED_FIELDS)
}