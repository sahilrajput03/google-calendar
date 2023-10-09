import express from 'express'
import url from 'url';
// Import the Calendar API client library.
import { calendar_v3, google } from 'googleapis'
import { generateHtmlTag } from './utility';
import 'dotenv/config'

const app = express()
const port = 3000

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URL = process.env.REDIRECT_URL

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URL) {
  console.error('Error: Please define all values in .env file, refer .env.template file.')
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);


// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar',
  // 'https://www.googleapis.com/auth/drive.metadata.readonly'
];

let calendar = null as null | calendar_v3.Calendar;

// Note: Leading `/` is necessary
const eventsPagePath = '/events'

app.get('/', (req, res) => {
  if (calendar) {
    res.redirect(eventsPagePath)
  } else {
    const authorizationUrl = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      // If you only need one scope you can pass it as a string
      scope: scopes
    });
    // Output: http://localhost/callback?code=CODE_HERE

    res.send(`
    You are not authenticated, please authenticate youself via below button:
    <br/>
    ${generateHtmlTag(authorizationUrl)}
    `)
  }
})

app.get('/callback', async (req, res) => {
  // Handle the OAuth 2.0 server response
  let q = url.parse(req.url, true).query; // {}
  // console.log('q?', q); // Output: { code: string, scope: string }

  // Get access and refresh tokens (if access_type is offline)
  let { tokens } = await oauth2Client.getToken(q.code as string) as any;
  // console.log('tokens?', tokens);
  // Output: { access_token: string, scope: string, token_type: 'Bearer', expiry_date: 1696861607226 }

  oauth2Client.setCredentials(tokens);

  // SDK Docs - https://googleapis.dev/nodejs/googleapis/latest/calendar/classes/Calendar.html
  calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  res.redirect(eventsPagePath)
})

app.get(eventsPagePath, async (req, res) => {
  if (!calendar) {
    res.redirect('/')
  }
  else {
    // Set the timeMin and timeMax parameters.
    const now = new Date();
    const timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const timeMax = new Date(timeMin.getTime() + 24 * 60 * 60 * 1000);

    try {
      // Call the events.list() method to get events for today.
      const options = {
        calendarId: 'primary',
        timeMin,
        timeMax,
      };
      const response: any = await calendar.events.list(options as any)

      // Parse the response JSON.
      const events = response.data.items;

      // Print the event summaries.
      const eventSummaries = events.map((e: any) => e.summary)
      console.log("eventSummaries?", eventSummaries);
      res.send(eventSummaries)
    } catch (error) {
      console.error('Failed to fetch events list?', error);
      res.send(error)
    }
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})