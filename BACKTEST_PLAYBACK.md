# Backtest Playback Functionality

This document describes the implementation of the backtest playback functionality that matches TraderScasa's interface.

## Features Implemented

### 1. Preloader
- Added loading state when starting playback
- Shows "Loading playback..." message with spinner
- Simulates loading time for better user experience

### 2. Playback Controls
- Play/Pause button with proper icons
- Skip forward/backward buttons (10 candlesticks)
- Reset button to restart playback
- Volume control slider
- Timeline slider for manual navigation
- Time display showing current/total time
- Playback speed controls (0.5x, 1x, 2x, 4x)

### 3. Session Selection
- Added play button to session cards that automatically starts playback
- Maintains existing "View Chart" functionality

### 4. Chart Enhancements
- Added current time indicator at bottom-left of chart
- Improved data handling for playback

## Implementation Details

### Backtest.tsx Changes
- Added state variables for playback control
- Implemented playback functions (start, pause, reset, skip)
- Added UI components for playback controls
- Integrated preloader during playback initialization
- Updated session selection to support auto-playback

### TradingViewChart.tsx Changes
- Added current time indicator
- Improved data update handling for playback
- Maintained existing trading functionality

## How It Works

1. **Session Selection**: Users can select a backtest session from the list
2. **Chart Loading**: Chart data is loaded for the selected session
3. **Playback Initiation**: 
   - Click "View Chart" to load chart without starting playback
   - Click the play button (▶) to load chart and automatically start playback
4. **Playback Controls**:
   - Play/Pause: Start or pause the playback
   - Skip: Move forward/backward by 10 candlesticks
   - Reset: Return to the beginning of the data
   - Timeline: Manually navigate through the data
   - Speed: Adjust playback speed
   - Volume: Control audio volume (visual only in this implementation)

## User Experience

### Preloader
When users click the play button on a session:
1. Chart loads normally
2. Playback preloader appears for 1.5 seconds
3. Playback begins automatically

### Playback Interface
The playback interface includes:
- Control buttons (play/pause, skip, reset)
- Timeline slider showing progress
- Time display (current/total)
- Speed controls
- Volume slider

### Chart Updates
During playback:
- Chart updates in real-time as data progresses
- Current time indicator shows the latest timestamp
- Trading functionality remains available

## Technical Implementation

### State Management
- `isPlaying`: Controls play/pause state
- `currentTimeIndex`: Tracks current position in data
- `playbackSpeed`: Controls playback speed
- `volume`: Controls volume level
- `isLoadingPlayback`: Shows preloader state

### Playback Logic
- Uses `setInterval` for timed data progression
- Clears interval when paused or completed
- Handles manual slider navigation
- Supports multiple playback speeds

### Data Handling
- Chart data is sliced based on `currentTimeIndex`
- New data is appended as playback progresses
- Efficient updates to minimize performance impact

## Future Enhancements

1. **Audio Feedback**: Add actual audio cues for trades/events
2. **Event Markers**: Show trade entry/exit points on chart
3. **Performance Metrics**: Display real-time performance stats
4. **Bookmarking**: Allow users to save specific time points
5. **Export**: Enable export of playback sessions

## Testing

To test the playback functionality:
1. Create a new backtest session
2. Select the session to view the chart
3. Click the play button on the session card to start playback
4. Use playback controls to navigate through the data
5. Test trading functionality during playback

## API Requirements

No additional API endpoints are required for basic playback functionality. All data is loaded when the session is selected.

For enhanced features, the following could be considered:
- `/api/backtest/events` - Get trade events for a session
- `/api/backtest/bookmarks` - Manage playback bookmarks
- `/api/backtest/export` - Export playback session