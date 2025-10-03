# Backtest URL Routing Implementation

## Overview

This document describes the implementation of URL routing for backtest sessions to match the TradersCasa pattern: `/backtest/session/:id`

## Changes Made

### 1. App Routing (`client/src/App.tsx`)

Added a new route to support session-specific URLs:
```tsx
<Route path="/backtest/session/:id" component={Backtest} />
```

### 2. Backtest Component Updates (`client/src/pages/Backtest.tsx`)

#### New Features:
1. **URL Parameter Support**: Added `useParams` hook to extract session ID from URL
2. **Auto-Session Selection**: When a session ID is present in the URL, automatically load and select that session
3. **URL Updates**: When selecting a session, update the URL to include the session ID
4. **URL Cleanup**: When returning to the sessions list, remove the session ID from the URL

#### Key Implementation Details:

1. **Parameter Extraction**:
   ```typescript
   import { useParams } from "wouter";
   const params = useParams();
   ```

2. **Auto-Selection Logic**:
   ```typescript
   // In the useEffect that loads sessions
   if (params.id) {
     const session = formattedSessions.find(s => s.id === params.id);
     if (session) {
       handleSessionSelect(session);
     }
   }
   ```

3. **URL Updates**:
   ```typescript
   const handleSessionSelect = (session: any) => {
     setSelectedSession(session);
     // ... other logic
     window.history.pushState({}, '', `/backtest/session/${session.id}`);
   };
   ```

4. **URL Cleanup**:
   ```typescript
   <Button 
     variant="outline" 
     onClick={() => {
       setSelectedSession(null);
       window.history.pushState({}, '', '/backtest');
     }}
   >
     Back to Sessions
   </Button>
   ```

## How It Works

1. **Direct URL Access**: Users can now access a specific backtest session directly using a URL like:
   ```
   https://your-app.com/backtest/session/68d760138e2dc55a374e574c
   ```

2. **Automatic Session Loading**: When the Backtest page loads with a session ID in the URL:
   - All sessions are loaded from Supabase
   - The specific session is automatically selected and displayed
   - Chart data for that session's pair is loaded

3. **URL Synchronization**: As users navigate between sessions:
   - Selecting a session updates the URL to include the session ID
   - Returning to the sessions list removes the session ID from the URL

## Benefits

1. **Bookmarkable Sessions**: Users can bookmark specific backtest sessions
2. **Direct Sharing**: Users can share direct links to specific sessions
3. **Browser History**: Back/forward navigation works properly with session URLs
4. **SEO Friendly**: Session URLs are more descriptive and meaningful

## Testing

To test the implementation:

1. Create a new backtest session
2. Click "View Chart" to open the session
3. Verify the URL updates to include the session ID
4. Copy the URL and paste it in a new browser tab
5. Verify the same session loads automatically
6. Click "Back to Sessions" and verify the URL reverts to `/backtest`

## Pair Selection

The trading pairs are currently defined as a hardcoded array in the CreateSessionModal:
```typescript
const tradingPairs = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  "AUDUSD",
  "USDCAD",
  "NZDUSD",
  "XAUUSD",
  "XAGUSD",
  "BTCUSD",
  "ETHUSD",
  "US30",
  "NAS100",
  "SPX500",
];
```

This approach provides a predefined list of popular trading pairs. In the future, this could be enhanced to:
- Load pairs dynamically from an API
- Allow custom pair entry
- Provide pair search functionality