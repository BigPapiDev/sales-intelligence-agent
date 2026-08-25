# Google OAuth scopes for the scheduling copilot

## Findings

The first real Google integration needs these scopes:

- `https://www.googleapis.com/auth/gmail.readonly` to read the scheduling request body.
- `https://www.googleapis.com/auth/gmail.send` to send the approved reply.
- `https://www.googleapis.com/auth/calendar.events` to read appointment-calendar event details and create the approved event.

`gmail.readonly` is a restricted scope and grants access to the user's Gmail messages and settings, not only a label or shared inbox.
`calendar.events` grants access to events on all calendars available to that Google account, not only the appointment calendar.
The product can enforce its chosen inbox label and appointment calendar in application logic, but OAuth itself cannot enforce those narrower boundaries.

For an external production app, Google requires OAuth app verification for public apps requesting user-data scopes.
Restricted Gmail scopes can require additional restricted-scope verification and, when restricted data is stored on or transmitted through servers, a security assessment.

## Recommendation

Keep the first prototype on synthetic data.
Before connecting a real customer account, make the broad Google grant explicit in the consent screen and decide whether the product can accept it.
Request no write scope beyond `gmail.send` and `calendar.events`.

## Sources

- [Gmail API scopes](https://developers.google.com/gmail/api/auth/scopes)
- [Google Calendar API scopes](https://developers.google.com/calendar/api/auth)
- [Google OAuth app verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification)
- [Restricted-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)
