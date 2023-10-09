# Google Calendar APIs

Using google api using `googleapis`, official nodejs packge from google.

Use `.env.template` to create your own `.env` file.

**Quick Links:**

- Refer my postman guide as well: [Click here](https://github.com/sahilrajput03/sahilrajput03/blob/master/learn-google-console-apis-via-oauth2.md)
- Google Calendar:
	-  SDK Docs: [Click here](https://googleapis.dev/nodejs/googleapis/latest/calendar/classes/Calendar.html)
	- Calendar APIs:
		- List: [Click here](https://developers.google.com/calendar/api/v3/reference/events/list)

TODO:
- Please check `todo-auth.ts` file for auth refresh mechanism in future and also read docs.

**NOTE:**

To your google console project -

1. you must add below scopes:
	- https://www.googleapis.com/auth/calendar.events
	- https://www.googleapis.com/auth/calendar
2. you must add a tester email
3. you must add correct callback url same as you defined in `.env` file