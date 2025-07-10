# Body Composition Tracker - Next.js Migration

> 🚀 **Migrated from Google Apps Script to Next.js + Supabase**

A modern web application for tracking body composition metrics with charts, statistics, and comprehensive testing.

## ✨ Features

- **Body Composition Tracking**: Weight, BMI, body fat %, muscle mass, visceral fat, calories
- **Beautiful Charts**: Interactive Chart.js visualizations
- **Responsive Design**: Mobile-first PWA experience
- **Real-time Statistics**: Live data analysis and trends
- **TypeScript**: Type-safe implementation
- **Comprehensive Testing**: 19 tests with Jest + React Testing Library
- **Mock API**: MSW for development and testing

## 🏗️ Architecture

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI**: Tailwind CSS + Custom gradient design
- **Database**: Supabase (PostgreSQL) 
- **Charts**: Chart.js with react-chartjs-2
- **Testing**: Jest + React Testing Library + Playwright
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd body-composition-tracker

# Install dependencies
npm install

# Install Playwright browsers
npm run playwright:install

# Run development server
npm run dev
```

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📋 Available Scripts

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server

### Testing
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:all` - Run all tests

### Code Quality
- `npm run lint` - Run ESLint

## 🧪 Testing

### Unit Tests (Jest + React Testing Library)
- **API Client**: Data validation, statistics calculation, error handling
- **Type Definitions**: TypeScript interface validation
- **Mock Integration**: MSW for API mocking

### E2E Tests (Playwright)
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile device testing
- Real user interaction scenarios

### Coverage
- Target: 80% statements, branches, functions, lines
- Current: 89% coverage on core logic

## 📊 Data Model

```typescript
interface BodyData {
  id?: number
  date: string
  weight: number
  bmi?: number
  body_fat?: number
  muscle_mass?: number
  visceral_fat?: number
  calories?: number
  created_at?: string
}
```

## 🔧 API Endpoints

- `GET /api/body-data` - Retrieve all body data
- `POST /api/body-data` - Save new body data
- `GET /api/app-info` - Get application info
- `GET /api/health` - Health check

## 📱 PWA Features

- Service Worker for offline functionality
- Web App Manifest for mobile installation
- Responsive design for all devices
- Touch-friendly interface

## 🔄 Migration History

This project was migrated from Google Apps Script to provide:
- Better development experience
- Modern tech stack
- Comprehensive testing
- Scalable architecture
- Enhanced performance

**Original Repository**: [GAS Version](../BodyCompositionTracker-legacy/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Chart.js
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel
- **Package Manager**: npm

---

**Built with ❤️ for health tracking and modern web development**