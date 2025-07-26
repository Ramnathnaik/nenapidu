# Send Email API Documentation

## Overview
The `/api/send-email` endpoint allows you to send emails to authenticated users using Nodemailer with Clerk authentication.

## Endpoint: `/api/send-email`

### Authentication
- Requires user to be authenticated with Clerk
- User's email address is automatically retrieved from Clerk profile
- Prioritizes verified email addresses

### HTTP Methods

#### POST - Send Email
Sends an email to the authenticated user.

**Request Body:**
```json
{
  "subject": "string (required)",
  "message": "string (required)",
  "htmlContent": "string (optional)"
}
```

**Response Success (200):**
```json
{
  "status": "Email sent successfully",
  "messageId": "string",
  "sentTo": "user@example.com",
  "userInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com"
  }
}
```

**Response Error (400):**
```json
{
  "status": "Bad Request",
  "error": "Subject and message are required"
}
```

**Response Error (401):**
```json
{
  "status": "Unauthorized",
  "error": "User not authenticated"
}
```

#### GET - Get User Email Info
Returns the authenticated user's email information.

**Response Success (200):**
```json
{
  "status": "Success",
  "userInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "user@example.com",
    "emailAddresses": [
      {
        "emailAddress": "user@example.com",
        "verificationStatus": "verified"
      }
    ]
  }
}
```

## Environment Variables

Add these variables to your `.env.local` file:

```env
# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

## Email Provider Setup

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → App passwords
   - Generate password for "Mail"
   - Use this password as `SMTP_PASS`

### Other Providers
- **Outlook/Hotmail**: Use `smtp.live.com` (port 587)
- **Yahoo**: Use `smtp.mail.yahoo.com` (port 587)
- **Custom SMTP**: Configure your own SMTP server details

## Usage Examples

### Basic Email
```javascript
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subject: 'Welcome!',
    message: 'Thank you for joining us!',
  }),
});
```

### HTML Email
```javascript
const response = await fetch('/api/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subject: 'Welcome!',
    message: 'Thank you for joining us!',
    htmlContent: '<h1>Welcome!</h1><p>Thank you for joining us!</p>',
  }),
});
```

### Get User Info
```javascript
const response = await fetch('/api/send-email', {
  method: 'GET',
});
```

## Features

1. **Clerk Integration**: Automatically retrieves user email from Clerk
2. **Email Prioritization**: Uses verified emails first, falls back to primary email
3. **Flexible Content**: Supports both plain text and HTML emails
4. **Error Handling**: Comprehensive error handling and logging
5. **Environment Configuration**: Easy SMTP configuration via environment variables
6. **Dummy Credentials**: Works with dummy credentials for development

## Error Handling

The API handles various error scenarios:
- User not authenticated
- Missing required fields
- User has no email address
- SMTP connection failures
- Invalid email formats

## Security Notes

1. **Environment Variables**: Never commit real SMTP credentials to version control
2. **Rate Limiting**: Consider implementing rate limiting for production use
3. **Email Validation**: The API validates email addresses through Clerk
4. **Authentication**: Only authenticated users can send emails

## Testing

For development, you can use dummy SMTP credentials. The API will attempt to send emails but may fail silently with invalid credentials.

For production testing, use services like:
- Mailtrap (for testing)
- SendGrid
- Mailgun
- AWS SES

## Dependencies

- `nodemailer`: Email sending library
- `@clerk/nextjs`: Authentication and user management
- `@types/nodemailer`: TypeScript definitions
