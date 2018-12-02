/* Node core imports */
const crypto = require('crypto')

/* Relative imports */
const Config = require('./config')

// Helpers for various tasks
const Helpers = {
  hash: hashFn,
  parseJsonToObject: parseJsonToObjectFn,
  createRandomString: createRandomStringFn,
}

module.exports = Helpers


////////////////////


/**
 * Hashes the given string with SHA256
 * @param  {str} string to be hashed
 * @return {str}        hashed string
 */
function hashFn(string) {
  return typeof(string) == 'string' &&
  string.length > 0 &&
  crypto.createHmac('sha256', Config.SECRET_HASH).update(string).digest('hex')
}

/**
 * Returns the JSON object from that string or false
 * @param  {str} string
 * @return {JSON|false}
 */
function parseJsonToObjectFn(string) {
  try {
    return JSON.parse(string)
  } catch(e) {
    return {}
  }
}

// Gets a random item from a list
const getRandomFromList = l => l[Math.floor(Math.random() * l.length)]

// Creates a random string with length n from an alphabet
// a => b => a
const createStr = (alphabet, n) =>
  Array(n).fill().reduce(s => s + getRandomFromList(alphabet), '')


/**
 * Create a string of random alphanumeric characters of the given length
 * @param {number} strLength - length of the new created random string
 * @return {str}
 */
function createRandomStringFn(strLength) {
  const alphaChars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return (typeof(strLength) === 'number' && strLength > 0)
    && createStr(alphaChars, strLength)
}
