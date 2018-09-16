/* Library for storing and editing data */

/* Node core imports */
const fs = require('fs')
const path = require('path')

// Constants
const ERRORS = {
  CLOSE_FILE: 'Error closing file',
  WRITE_FILE: 'Error writing to a new file',
  CREATE_FILE: 'Coudn`t create a new file, it may already exist',
  UPDATE_FILE: 'Coudn`t open the file for updating, it may not exist yet',
  TRUNCATE_FILE: 'Error truncating file',
  DELETE_FILE: 'Error deleting file',
}

// Helpers
/**
 * Close the file or callbacks with an error
 * @param  {fileId}   fileDescriptor identifying the file
 * @param  {fn} fn callback
 */
const closeFileFn = (fileDescriptor, fn) =>
  fs.close(
    fileDescriptor,
    (closeError) => fn(closeError ? ERRORS.CLOSE_FILE : false)
  )

/**
 * Writes the string into the file and closes it if succeeded
 * @param  {fileId}   fileDescriptor identifying the open file
 * @param  {obj}   data to be written in the file
 * @param  {fn} fn callback
 */
const writeDataAndCloseFile = (fileDescriptor, data, fn) =>
  // Write to file and close it
  fs.writeFile(
    fileDescriptor,
    JSON.stringify(data),
    writeError => writeError
      ? fn(ERRORS.WRITE_FILE) // Error writing to the file
      : closeFileFn(fileDescriptor, fn)
    )


// Container of the module
const lib = {}

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '..', '.data')

/**
 * Creates a file to write the data into
 * @param  {str}   dir directory where the file should be created
 * @param  {str}   file name
 * @param  {obj}   data to be written in JSON format
 * @param  {Function} callback fn
 */
lib.create = (dir, file, data, callback) => {

  // Create and open the file for writing
  fs.open(
    `${path.join(lib.baseDir, dir, file)}.json`,
    'wx',
    (openError, fileDescriptor) => openError || !fileDescriptor
      ? callback(ERRORS.CREATE_FILE) // Error creating the file
      : writeDataAndCloseFile(fileDescriptor, data, callback)
    )
}

/**
 * Read the contents of a file
 * @param  {str}   dir directory where the file is located
 * @param  {str}   file name
 * @param  {Function} callback fn
 */
lib.read = (dir, file, callback) =>
  fs.readFile(
    `${path.join(lib.baseDir, dir, file)}.json`,
    'utf8',
    (err, data) => callback(err, data)
  )

/**
 * Updates the contents of a file
 * @param  {str}   dir directory where the file should be created
 * @param  {str}   file name
 * @param  {obj}   data to be written in JSON format
 * @param  {Function} callback fn
 */
lib.update = (dir, file, data, callback) =>
  // Open the file for writing
  fs.open(
    `${path.join(lib.baseDir, dir, file)}.json`,
    'r+', // Open it for writting and error if file doesn't exist
    (openError, fileDescriptor) => openError || !fileDescriptor
      ? callback(ERRORS.UPDATE_FILE)
      : fs.truncate(
          fileDescriptor,
          truncateError => truncateError
            ? callback(ERRORS.TRUNCATE_FILE) // Error truncating the file
            : writeDataAndCloseFile(fileDescriptor, data, callback)
        )
  )

/**
 * Delete a file
 * @param  {str}   dir directory where the file should be created
 * @param  {str}   file name
 * @param  {Function} callback fn
 */
lib.delete = (dir, file, callback) =>
  fs.unlink(
    `${path.join(lib.baseDir, dir, file)}.json`,
    deleteError => callback(deleteError ? ERRORS.DELETE_FILE : false)
  )

module.exports = lib
