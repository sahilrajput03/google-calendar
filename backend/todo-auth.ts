// NOTE: I am using same clientId and clientSecret as that of postman.
// It is possible because I added 'http://localhost:3000/callback' as
// another redirect url in google cloud console.

// TODO URGENT: Mange token and refresh tokens by reading below docs please!
// Learn token mechanisms - https://developers.google.com/identity/protocols/oauth2/web-server#offline
// // Access tokens expire. This library will automatically use a refresh token to obtain a new access token if it is about to expire. An easy way to make sure you always store the most recent tokens is to use the tokens event:
// oauth2Client.on('tokens', (tokens) => {
//   if (tokens.refresh_token) {
//     // store the refresh_token in your secure persistent database
//     console.log('INFO :: tokens.refresh_token?', tokens.refresh_token);
//   }
//   console.log('INFO :: tokens.access_token?', tokens.access_token);
// });

// oauth2Client.setCredentials({
//   refresh_token: `STORED_REFRESH_TOKEN`
// });