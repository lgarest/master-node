/* Node core imports */
const crypto = require('crypto')

/* Relative imports */
const Config = require('./config')

// Helpers for various tasks
const Helpers = {
  hash: hashFn,
  parseJsonToObject: parseJsonToObjectFn,
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