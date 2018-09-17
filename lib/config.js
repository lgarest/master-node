
const baseEnv = {
  httpPort: 3000,
  httpsPort: 3001,
  SECRET_HASH: '256 hashing secret key',
}

// Container for all the environments
const environments = {
  development: {
    ...baseEnv,
    envName: 'development'
  },
  staging: {
    ...baseEnv,
    envName: 'staging'
  },
  production: {
    ...baseEnv,
    httpPort: 80,
    httpsPort: 443,
    envName: 'production'
  }
}

// Determine which env was passed as a command-line argument
const currentEnv = typeof(process.env.NODE_ENV) == 'string'
  ? process.env.NODE_ENV.toLowerCase()
  : '';

// Check that the current environment is defined previously
const envToExport = typeof(environments[currentEnv]) == 'object'
  ? environments[currentEnv]
  : environments.development;

// Export the module
module.exports = envToExport;