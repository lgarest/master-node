/* Node core imports */
const fs = require('fs')
const path = require('path')

/* relative imports */
const Helpers = require('./helpers')


/* Library for storing and editing data */
const Data = {
  // Base directory of the data folder
  baseDir: path.join(__dirname, '..', '.data'),
  create: createFn,
  read: readFn,
  update: updateFn,
  delete: deleteFn,
}

module.exports = Data


////////////////////


// Constants
const ERRORS = {
  CLOSE_FILE: 'Error closing file',
  WRITE_FILE: 'Error writing to a new file',
  CREATE_FILE: 'Coudn`t create a new file, it may already exist',
  UPDATE_FILE: 'Coudn`t open the file for updating, it may not exist yet',
  TRUNCATE_FILE: 'Error truncating file',
  DELETE_FILE: 'Error deleting file',
}

/**
 * Close the file or callbacks with an error
 * @param  {number}   fileRef file descriptor identifying the file
 * @param  {fn} fn callback
 */
const closeFileFn = (fileRef, fn) =>
  fs.close(
    fileRef,
    (closeError) => fn(closeError ? ERRORS.CLOSE_FILE : false)
  )

/**
 * Writes the string into the file and closes it if succeeded
 * @param  {number}   fileRef file descriptor identifying the file
 * @param  {obj}   data to be written in the file
 * @param  {fn} fn callback
 */
const writeDataAndCloseFile = (fileRef, data, fn) =>
  // Write to file and close it
  fs.writeFile(
    fileRef,
    JSON.stringify(data),
    writeError => writeError
      ? fn(ERRORS.WRITE_FILE)
      : closeFileFn(fileRef, fn)
  )

const fileDir = (dir, file) =>
  `${path.join(Data.baseDir, dir, file)}.json`

/**
 * Creates a file to write the data into
 * @param  {str}   dir directory where the file should be created
 * @param  {str}   file name
 * @param  {obj}   data to be written in JSON format
 * @param  {fn} callback fn
 */
function createFn(dir, file, data, callback) {
  // Create and open the file for writing
  fs.open(fileDir(dir, file), 'wx', (openError, fileRef) =>
    !openError && fileRef
      ? writeDataAndCloseFile(fileRef, data, callback)
      : callback(ERRORS.CREATE_FILE) // Error creating the file
  )
}

/**
 * Read the contents of a file
 * @param  {str}   dir directory where the file is located
 * @param  {str}   file name
 * @param  {fn} callback fn
 */
function readFn(dir, file, callback) {
  fs.readFile(fileDir(dir, file), 'utf8', (err, data) =>
    callback(err, !err ? Helpers.parseJsonToObject(data) : data)
  )
}

/**
 * Updates the contents of a file
 * @param  {str}   dir directory where the file should be created
 * @param  {str}   file name
 * @param  {obj}   data to be written in JSON format
 * @param  {fn} callback fn
 */
function updateFn(dir, file, data, callback) {
  const fileTruncatedFn = fileRef => truncateError => truncateError
    ? callback(ERRORS.TRUNCATE_FILE) // Error truncating the file
    : writeDataAndCloseFile(fileRef, data, callback)

  const fileOpenedFn = (openError, fileRef) => (openError || !fileRef)
    ? callback(ERRORS.UPDATE_FILE)
    : fs.truncate(fileRef, fileTruncatedFn(fileRef))

  // r+ to open it for writting
  fs.open(fileDir(dir, file), 'r+', fileOpenedFn)
}

/**
 * Delete a file
 * @param  {str}   dir directory where the file should be created
 * @param  {str}   file name
 * @param  {fn} callback fn
 */
function deleteFn(dir, file, callback) {
  fs.unlink(fileDir(dir, file), deleteError =>
    callback(deleteError ? ERRORS.DELETE_FILE : false))
}
