# Benzou Info - News Ticker Application

## Technical Overview

**Benzou Info** is a modern news ticker application built with Next.js 14 that displays world news from The New York Times RSS feed in a rotating carousel format.

## Architecture & Technology Stack

### Frontend Framework

- **Next.js 14.2.8** - React-based full-stack framework with App Router
- **React 18** - UI library with hooks for state management
- **TypeScript 5** - Type-safe JavaScript development

### Styling & UI

- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Custom Fonts** - Geist Sans and Geist Mono (local font files)
- **Responsive Design** - Mobile-first approach with max-width constraints

### Backend & Data Processing

- **RSS Parser 3.13.0** - Node.js library for parsing RSS feeds
- **Next.js API Routes** - Server-side API endpoints
- **Custom Image Handling** - Remote image optimization for NYT content

## Application Structure

### Core Components

#### 1. **Main Page (`src/app/page.tsx`)**

- Entry point of the application
- Renders the header with "Benzou Info" title
- Integrates the `NewsChannel` component

#### 2. **NewsChannel Component (`src/app/components/NewsChannel.tsx`)**

- **State Management**: Uses React hooks (`useState`, `useEffect`)
- **Data Fetching**: Calls `/news` API endpoint every 5 minutes
- **Auto-rotation**: Cycles through news items every 5 seconds
- **Image Display**: Renders news images with Next.js Image optimization
- **Responsive Layout**: Dark theme with gray background and white text

#### 3. **News API Route (`src/app/news/route.ts`)**

- **RSS Processing**: Fetches and parses NYT World news RSS feed
- **Custom Fields**: Handles media content and image metadata
- **Data Transformation**: Reshapes RSS data for frontend consumption
- **Error Handling**: Graceful error responses with proper HTTP status codes

### Data Flow

1. **RSS Feed Source**: `https://rss.nytimes.com/services/xml/rss/nyt/World.xml`
2. **Server Processing**: RSS parser extracts articles with media content
3. **API Response**: JSON format with transformed news items
4. **Client Consumption**: React component fetches and displays data
5. **Auto-refresh**: Continuous updates every 5 minutes

### Key Features

#### News Item Structure

```typescript
interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  image: {
    url: string;
    medium: string;
    width: number;
    height: number;
  };
}
```

#### Auto-rotation System

- **5-second intervals** between news items
- **Circular navigation** using modulo operator
- **Smooth transitions** with React state management

#### Image Optimization

- **Next.js Image component** for performance
- **Remote patterns** configured for NYT domain
- **Responsive sizing** with object-cover for consistent display

## Configuration

### Next.js Configuration (`next.config.mjs`)

- **Image Optimization**: Configured for `static01.nyt.com` domain
- **Remote Patterns**: Secure image loading from trusted sources

### Development Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - Code linting

## Performance Considerations

- **Server-side RSS parsing** reduces client-side processing
- **Image optimization** through Next.js Image component
- **Efficient re-rendering** with React hooks
- **Memory management** with proper cleanup in useEffect

## Security Features

- **CORS handling** through Next.js API routes
- **Image domain restrictions** in Next.js config
- **External link security** with `rel="noopener noreferrer"`

## Deployment Ready

The application is configured for production deployment with:

- TypeScript compilation
- ESLint code quality checks
- Optimized builds
- Environment-agnostic configuration

---

_Built with modern web technologies for optimal performance and user experience._
