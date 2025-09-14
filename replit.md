# Overview

FlowdeX is a Software as a Service (SaaS) trading journal and backtesting platform designed for financial traders. The application provides comprehensive tools for analyzing trading performance, conducting market replay backtests, and maintaining detailed trading journals. Built as a modern web application, it features a professional dark theme with blue/grey accents and offers both free and subscription-based tiers.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built using React with TypeScript, utilizing modern React patterns including hooks and functional components. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, providing a consistent and accessible component library. Styling is handled through Tailwind CSS with a custom dark theme configuration featuring CSS variables for theming flexibility.

The application follows a single-page application (SPA) pattern with client-side routing handled by Wouter. State management is implemented using TanStack Query (React Query) for server state management and caching, with React's built-in state management for local component state.

## Backend Architecture
The server-side is built on Node.js with Express.js as the web framework. The architecture follows RESTful API principles with clear separation of concerns through dedicated modules for routing, authentication, and data storage. The server implements a storage abstraction layer through an interface-based approach, allowing for flexible data access patterns.

Authentication is handled through OpenID Connect (OIDC) integration with Replit's authentication system, using Passport.js for session management. Sessions are stored in PostgreSQL using connect-pg-simple for persistence across server restarts.

## Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema supports multi-tenancy through user-scoped data with the following core entities:

- Users: Store authentication and profile information
- Trading Sessions: Represent backtesting scenarios with configurable parameters
- Trades: Individual trade records with entry/exit details and P&L calculations
- Journal Entries: Manual notes and observations linked to trades or sessions
- Sessions: Authentication session storage for secure user management

The database design emphasizes referential integrity with cascade deletions to maintain data consistency when users or sessions are removed.

## Development and Build System
The project uses Vite as the build tool and development server, providing fast hot module replacement and optimized production builds. TypeScript is configured for strict type checking across the entire codebase with path mapping for clean imports.

The build process separates client and server builds, with the client building to static assets and the server bundling to a single Node.js executable using esbuild. This approach enables efficient deployment to various hosting platforms.

## Security Considerations
Authentication flows are secured through OIDC with secure session cookies and CSRF protection. All API endpoints require authentication, with user isolation enforced at the database query level. The application implements proper error handling to prevent information leakage while providing meaningful feedback to users.

# External Dependencies

## Authentication Services
- **Replit OIDC**: Primary authentication provider using OpenID Connect protocol for secure user authentication and session management

## Database Infrastructure  
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting with connection pooling via @neondatabase/serverless driver
- **Drizzle ORM**: Type-safe database toolkit for schema management and query building

## Payment Processing
- **Stripe**: Integrated for handling subscription billing, payment processing, and subscription tier management with React components for seamless checkout flows

## Market Data Integration
- **TwelveData API**: Financial market data provider for historical price data, real-time quotes, and technical indicators (referenced in project requirements)

## UI and Development Libraries
- **Radix UI**: Accessible, unstyled UI primitives for building the component library
- **shadcn/ui**: Pre-built component system based on Radix UI with Tailwind CSS styling
- **TanStack Query**: Server state management and caching for API interactions
- **Wouter**: Lightweight client-side routing solution

## File Storage
- **AWS S3**: Cloud storage service for user-uploaded files, trading screenshots, and document attachments (referenced in project requirements)

## Development and Build Tools
- **Vite**: Modern build tool and development server with hot module replacement
- **TypeScript**: Type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **ESBuild**: Fast JavaScript bundler for production server builds