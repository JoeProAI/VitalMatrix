# VitalMatrix Community Pulse Feature

This package contains all the necessary files to add the Community Pulse feature to your VitalMatrix project on Bolt.new. This feature allows users to find healthcare facilities near them, view wait times, and submit reviews.

## Package Contents

- **CommunityPulse.tsx** - React component for the main interface
- **community-pulse.css** - Styles that match the dark theme of VitalMatrix
- **communityPulseService.ts** - Firebase service for geolocation queries and data management
- **communityPulse.ts** - TypeScript type definitions

## Installation Instructions for Bolt.new

### 1. Import Dependencies

First, add these required dependencies to your project:

```json
"dependencies": {
  "@react-google-maps/api": "^2.19.2",
  "geofirestore": "^5.2.0"
}
```

### 2. Import Files

Import the following files into their respective directories in your Bolt.new project:

- `src/components/CommunityPulse.tsx`
- `src/styles/community-pulse.css`
- `src/firebase/communityPulseService.ts`
- `src/types/communityPulse.ts`

### 3. Add Route to App.tsx

Add this import to your App.tsx:

```jsx
import CommunityPulse from './components/CommunityPulse';
```

Then add this route to your Routes component:

```jsx
<Route 
  path="/community-pulse" 
  element={
    <ProtectedRoute>
      <CommunityPulse />
    </ProtectedRoute>
  } 
/>
```

### 4. Configure Environment Variables

Make sure to add the Google Maps API key to your Bolt.new environment variables:

```
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

You'll need a Google Maps API key with the Maps JavaScript API enabled.

### 5. Import CSS

In your main CSS file or component, import the community pulse styles:

```javascript
import '../styles/community-pulse.css';
```

## Using the Community Pulse Feature

Once installed:

1. Navigate to `/community-pulse` in your application
2. Allow location access when prompted to see nearby facilities
3. Click on facility markers to see details and reviews
4. Submit reviews and wait time updates (requires authentication)

## Styling Notes

The Community Pulse feature uses the same dark theme (#121827) with blue accents (#3b82f6) as the rest of the VitalMatrix UI, maintaining a consistent and professional look. All UI elements have smooth transitions and follow the design patterns established in the main application.

## Firebase Requirements

Ensure your Firebase project has:
- Firestore enabled
- Authentication enabled
- Correct security rules to allow reading and writing to the facilities and reviews collections

## Need Help?

Refer to the in-code documentation or reach out to the development team for assistance with integration.
