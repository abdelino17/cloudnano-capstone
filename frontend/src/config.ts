// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'ksgba2txb1'
export const apiEndpoint = `https://${apiId}.execute-api.us-west-2.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-479patzi.eu.auth0.com', // Auth0 domain
  clientId: 'w5LlUGShpGtbFV7CLYKCpz5nY2xOzz3e', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
