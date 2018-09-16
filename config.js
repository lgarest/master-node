
// Container for all the environments
const environments = {}


// Development environment
environments.development = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'development'
}

// Staging environment
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging'
}

// Production environment
environments.production = {
  httpPort: 80,
  httpsPort: 443, // https port
  envName: 'production'
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