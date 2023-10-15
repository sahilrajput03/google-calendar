import express from 'express'
import url from 'url';
// Import the Calendar API client library.
import { calendar_v3, google } from 'googleapis'
import { generateHtmlTag } from './utility';
import cors from 'cors'
import 'dotenv/config'
import { EventType } from './types';

const app = express()

app.use(cors())

// Use the default body parser middleware
app.use(express.json());

const port = 38243 // for my systemd service

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

let calendar = null as null | calendar_v3.Calendar;

// TESTING ONLY...
// const tokens = {
//   access_token: '...',
//   scope: '...',
//   token_type: 'Bearer',
//   expiry_date: 3333
// }
// oauth2Client.setCredentials(tokens);
// calendar = google.calendar({ version: 'v3', auth: oauth2Client });
// TESTING ONLY...


// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar',
  // 'https://www.googleapis.com/auth/drive.metadata.readonly'
];


// Note: Leading `/` is necessary
const eventsPagePath = '/events'

app.get('/', (req, res) => {
  if (calendar) {
    res.redirect(eventsPagePath)
  } else {
    res.redirect('/auth')
  }
})

app.get('/auth', (req, res) => {
  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    // access_type: 'offline',
    // If you only need one scope you can pass it as a string
    scope: scopes
  });
  // Example authorizationUrl: `http://localhost/auth/callback?code=CODE_HERE`

  // res.send(generateHtmlTag(authorizationUrl))
  res.redirect(authorizationUrl)
})

// ! TODO: Remve this event handler as I am consuming the data via a real world case now
// ! in frontend.
app.get('/auth/callback', async (req, res) => {
  // Handle the OAuth 2.0 server response
  let q = url.parse(req.url, true).query; // {}
  // console.log('q?', q); // Output: { code: string, scope: string }

  // Get access and refresh tokens (if access_type is offline)
  let { tokens } = await oauth2Client.getToken(q.code as string) as any;
  console.log('baabu code?', q.code);
  // console.log('tokens?', tokens);
  // Output: { access_token: string, scope: string, token_type: 'Bearer', expiry_date: 1696861607226 }

  oauth2Client.setCredentials(tokens);
  console.log('tokens?', tokens);

  // SDK Docs - https://googleapis.dev/nodejs/googleapis/latest/calendar/classes/Calendar.html
  calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  res.redirect(eventsPagePath)
})

app.get('/auth/setup-oauth-client', async (req, res) => {
  // ? IMPORTANT NOTE: This `code` expires after one usage only, so if you hit
  // ? same API twice it may crash the OAUTH client.
  const { code } = req.query
  let { tokens } = await oauth2Client.getToken(code as string) as any;
  oauth2Client.setCredentials(tokens);
  calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  res.send('ok')
})

// ! TODO: Remve this event handler as I am consuming the data via a real world case now
// ! in frontend.
app.get(eventsPagePath, async (req, res) => {
  if (!calendar) { return res.redirect('/auth') }

  // Set the timeMin and timeMax parameters.
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

  // EXAMPLE:
  // now = 10/13/2023, 11:10:33 PM            - [ 13 Oct, 2023]
  // startOfToday = 10/13/2023, 12:00:00 AM   - [ 13 Oct, 2023]
  // endOfToday = 10/14/2023, 12:00:00 AM     - [ 14 Oct, 2023]

  try {
    // Call the events.list() method to get events for today.
    const options = {
      calendarId: 'primary',
      timeMin: startOfToday,
      timeMax: endOfToday,
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
})

app.get('/range', async (req, res) => {
  const { start, end } = req.query
  if (!start || !end) { return res.status(400).json({ message: 'Please send `start`, `end` and `code` query paramter values.' }) }

  try {
    // Call the events.list() method to get events for today.
    const options = {
      calendarId: 'primary',
      timeMin: start,
      timeMax: end,
    };
    const response: any = await calendar?.events.list(options as any)

    // Parse the response JSON.
    const events = response?.data?.items as EventType | undefined;

    // Print the event summaries.
    // const eventSummaries = events.map((e: any) => e.summary)
    // console.log("eventSummaries?", eventSummaries);
    // res.send(eventSummaries)

    if (events) {
      res.send(events)
    } else {
      res.status(400).send('Probably calendar is not initiated')
    }
  } catch (error) {
    console.error('Failed to fetch events list?', error);
    res.send(error)
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})