const fs = require('fs');
const dotenv = require('dotenv');
const { argv } = require('yargs');

// Load .env file
dotenv.config();

const environment = argv.env;
const isProduction = environment === 'prod';

const targetPath = `./src/environments/environment.${isProduction ? '' : 'development'}.ts`;

const apiUrl = isProduction ? process.env.NG_APP_API_URL_PROD : process.env.NG_APP_API_URL;

if (!apiUrl) {
  console.error(`Error: API_URL not found in .env for ${isProduction ? 'production' : 'development'} environment.`);
  process.exit(1);
}

const envConfigFile = `
export const environment = {
  production: ${isProduction},
  apiUrl: '${apiUrl}'
};
`;

console.log(`Generating environment file for ${environment} environment at ${targetPath}...`);
fs.writeFileSync(targetPath, envConfigFile);
console.log('Environment file generated successfully.');