# Google Analytics Client ID Consistency Guide

This guide explains how to maintain consistent client IDs between client-side and server-side Google Analytics events in your Next.js application.

## Overview

When tracking events both on the client-side (using gtag.js) and server-side (using Measurement Protocol), it's crucial to use the same `client_id` to ensure proper user journey tracking and attribution.

## Key Components

### 1. Analytics Utilities (`utils/analytics.ts`)

This file provides functions to retrieve the Google Analytics client ID and session ID from the client-side:

- `getGAClientId()`: Retrieves the client ID using `gtag.js('get')`
- `getGASessionId()`: Retrieves the session ID using `gtag.js('get')`
- `getGAIdentifiers()`: Gets both client ID and session ID in one call

### 2. Enhanced Server-Side Analytics (`services/analytics/googleAnalytics.ts`)

The server-side analytics service has been updated to:

- Accept and prioritize client-provided `client_id` and `session_id`
- Fall back to generated IDs if none are provided
- Maintain proper GA4 Measurement Protocol format

### 3. Updated API Routes

API routes (like `/api/contact`) now accept optional `clientId` and `sessionId` parameters to ensure consistent tracking.

## How It Works

### Client-Side Flow

1. User performs an action (e.g., submits a form)
2. Your frontend retrieves the GA client ID using `getGAClientId()`
3. The client ID is included in the API request to your server
4. Server-side events use the same client ID for consistency

### Example Usage

```typescript
import { getGAIdentifiers } from '@/utils/analytics'

// In your form submission handler
const handleSubmit = async (formData) => {
  // Get GA identifiers for consistent tracking
  const { clientId, sessionId } = await getGAIdentifiers()

  // Submit to your API with GA identifiers
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,
      clientId, // Ensures server-side events match client-side
      sessionId, // Maintains session consistency
    }),
  })
}
```

### Server-Side Integration

```typescript
// In your API route
export async function POST(req: Request) {
  const { email, name, message, clientId, sessionId } = await req.json()

  // Process the form...

  // Send GA event with consistent client ID
  await sendGAConversionEvent({
    eventName: ConversionEventName.SubmitEnquiry,
    email,
    properties: {
      name,
      message,
      ...(clientId && { client_id: clientId }),
      ...(sessionId && { session_id: sessionId }),
    },
  })
}
```

## Benefits

1. **Accurate Attribution**: Events from the same user are properly linked
2. **Better Analytics**: User journeys are tracked consistently across client and server
3. **Conversion Tracking**: Server-side conversions are properly attributed to client-side interactions
4. **Session Continuity**: Sessions remain consistent between client and server events

## Important Notes

### Client ID Format

- GA4 client IDs follow the format: `XXXXXXXXXX.YYYYYYYYYY`
- The first part is typically a random number, the second is a timestamp
- Always use the client ID retrieved from `gtag.js('get')` when available

### Fallback Behavior

- If `gtag` is not available (e.g., ad blockers), the system falls back to generating a client ID
- Generated client IDs use email hashing for consistency when possible
- Always include proper error handling for scenarios where GA is blocked

### Privacy Considerations

- Client IDs are not personally identifiable information
- They're used solely for analytics correlation
- Ensure compliance with your privacy policy and applicable regulations

## Testing

### Development Mode

- In development, GA events are logged to console instead of being sent
- This allows you to verify the client ID consistency without affecting production data

### Debug Mode

- Set `GA4_DEBUG_MODE=true` to enable GA4 debug responses
- This helps validate that events are properly formatted and accepted

## Troubleshooting

### Common Issues

1. **Client ID not retrieved**: Check that gtag.js is loaded and GA4 is initialized
2. **Undefined client ID**: Ensure the measurement ID is correctly configured
3. **Events not linking**: Verify the client ID format matches GA4 requirements

### Debug Steps

1. Check browser console for analytics utility messages
2. Verify the client ID format: should be exactly `XXXXXXXXXX.YYYYYYYYYY`
3. Use GA4 debug mode to validate server-side events
4. Check that both client and server events use the same client ID

## Example Implementation

See `components/examples/ContactFormExample.tsx` for a complete implementation example that demonstrates:

- Retrieving GA identifiers on the client
- Sending them to the server
- Using them for consistent server-side tracking
