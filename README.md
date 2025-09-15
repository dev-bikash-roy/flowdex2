# FlowdeX - Trading Journal & Backtesting Platform

FlowdeX is a Software as a Service (SaaS) application designed for financial traders to track, analyze, and improve their trading performance. The platform serves as a comprehensive trading journal and backtesting tool.

## Features

### Core Functionality
- **Chart Replay Engine**: Interactive charting with historical data replay
- **Manual Trading Interface**: Execute trades directly on charts
- **Trading Journal**: Automatic trade logging with manual notes and screenshots
- **Analytics Dashboard**: In-depth performance metrics and visualizations
- **User Accounts**: Secure authentication with subscription management

### Technical Implementation

#### Phase 1: Core Replay & Trading (Completed)
- ✅ Integrated TradingView Lightweight Charts for professional charting
- ✅ TwelveData API integration for market data
- ✅ Chart replay functionality with multiple timeframes
- ✅ Manual trading interface on charts
- ✅ Trade execution with position management

#### Phase 2: Journal & Analytics (In Progress)
- ✅ Trading session management
- ✅ Trade logging and tracking
- ✅ Performance analytics dashboard
- ⬜ Export functionality (CSV/PDF)

#### Phase 3: Accounts & Payments
- ✅ User authentication system
- ⬜ Subscription management
- ⬜ Stripe integration
- ⬜ Admin dashboard

#### Phase 4: Final Polish & Deployment
- ⬜ Performance optimization
- ⬜ Security enhancements
- ⬜ Documentation
- ⬜ Deployment scripts

## Technology Stack

### Frontend
- React.js with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI components
- React Query for state management
- Lightweight Charts for charting

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL database (via NeonDB)
- Drizzle ORM for database operations
- Passport.js for authentication

### APIs & Services
- TwelveData for market data
- Stripe for payments
- AWS S3 for file storage

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- TwelveData API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/flowdex.git
cd flowdex
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory based on the `.env.example` file with your actual credentials.

4. Set up PostgreSQL database:
   - Install PostgreSQL on your system
   - Create a new database named `flowdex`
   - Update the DATABASE_URL in your `.env` file with your actual database credentials

5. Run database migrations:
```bash
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

## Project Structure

```
flowdex/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions and services
│   │   ├── pages/       # Page components
│   │   └── App.tsx      # Main application component
├── server/              # Express backend
│   ├── services/        # External API integrations
│   ├── db.ts            # Database connection
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data storage layer
│   └── replitAuth.ts    # Authentication
├── shared/              # Shared code between frontend and backend
│   └── schema.ts        # Database schema
├── drizzle.config.ts    # Drizzle ORM configuration
└── package.json         # Project dependencies
```

## API Endpoints

### Authentication
- `GET /api/login` - Initiate login flow
- `GET /api/callback` - Handle authentication callback
- `GET /api/logout` - Logout user
- `GET /api/auth/user` - Get current user information

### Trading Sessions
- `POST /api/trading-sessions` - Create new trading session
- `GET /api/trading-sessions` - List all trading sessions
- `GET /api/trading-sessions/:id` - Get specific trading session
- `PUT /api/trading-sessions/:id` - Update trading session
- `DELETE /api/trading-sessions/:id` - Delete trading session

### Trades
- `POST /api/trades` - Execute new trade
- `GET /api/trades` - List trades (with optional sessionId filter)
- `GET /api/trades/:id` - Get specific trade
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade

### Journal Entries
- `POST /api/journal-entries` - Create journal entry
- `GET /api/journal-entries` - List journal entries
- `GET /api/journal-entries/:id` - Get specific journal entry
- `PUT /api/journal-entries/:id` - Update journal entry
- `DELETE /api/journal-entries/:id` - Delete journal entry

### Analytics
- `GET /api/analytics/performance` - Get performance metrics
- `GET /api/chart-data` - Get chart data for symbol/timeframe
- `GET /api/price` - Get current price for symbol

### Subscriptions
- `GET /api/subscription/plans` - Get available subscription plans
- `POST /api/subscription` - Create a new subscription
- `DELETE /api/subscription/:id` - Cancel a subscription

### File Storage
- `POST /api/file-upload-url` - Generate presigned URL for file upload
- `GET /api/file-download-url` - Generate presigned URL for file download

## Development Workflow

1. **Frontend Development**: 
   - Components in `client/src/components/`
   - Pages in `client/src/pages/`
   - Services in `client/src/lib/`

2. **Backend Development**:
   - Routes in `server/routes.ts`
   - Services in `server/services/`
   - Data storage in `server/storage.ts`

3. **Database Schema**:
   - Defined in `shared/schema.ts`
   - Migrations handled by Drizzle ORM

## Documentation

For detailed information about the application architecture and setup:

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup instructions
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture overview
- [HOW_TO_MAKE_IT_FULLY_FUNCTIONAL.md](HOW_TO_MAKE_IT_FULLY_FUNCTIONAL.md) - Step-by-step configuration
- [FULLY_FUNCTIONAL_CHECKLIST.md](FULLY_FUNCTIONAL_CHECKLIST.md) - Implementation checklist
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Feature development progress
- [FINAL_IMPLEMENTATION_SUMMARY.md](FINAL_IMPLEMENTATION_SUMMARY.md) - Complete implementation overview
- [STATUS.md](STATUS.md) - Current service status dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- TradingView Lightweight Charts for charting components
- TwelveData for market data APIs
- Replit for authentication infrastructure

## Recent API Fixes

We've recently implemented several fixes to improve the API functionality:

1. **Authentication Consistency**: Fixed inconsistent authentication endpoints between local development and Replit deployment
2. **Database Connection**: Improved database connection handling with better fallback to in-memory storage
3. **Data Type Conversion**: Fixed data type mismatches between backend (string) and frontend (number) for decimal values
4. **Error Handling**: Enhanced error handling and validation in API endpoints

## Testing the Fixes

To test the API fixes, run:

```bash
npm run test:api
```

This will verify that authentication, trading sessions, and trade execution are working properly with the correct data types.
