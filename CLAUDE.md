# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: Branch Creation Rule
**ALWAYS create a new branch before making ANY code changes. This is mandatory.**

### Branch Naming Convention
- **Bug fixes**: `bugfix/description-of-fix`
- **New features**: `feature/description-of-feature`  
- **Improvements**: `improvement/description-of-change`
- **Documentation**: `docs/description-of-update`

### Workflow
1. `git checkout -b <branch-type>/<description>` - Create branch FIRST
2. Make changes
3. Commit changes
4. Push branch: `git push -u origin <branch-name>`
5. Create PR: `gh pr create --title "..." --body "..."`

**Never commit directly to main or develop branches.**

## Common Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server

### Testing
- `npm run test` - Run unit tests (Jest + React Testing Library)
- `npm run test:watch` - Run tests in watch mode for development
- `npm run test:coverage` - Run tests with coverage report (target: 80%)
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with interactive UI
- `npm run test:visual` - Run visual regression tests
- `npm run test:a11y` - Run accessibility tests
- `npm run test:all` - Run all test suites
- `npx playwright test --config=playwright-visual.config.ts` - Visual regression testing
- `npx playwright test --config=playwright-a11y.config.ts` - Accessibility testing

### Code Quality
- `npm run lint` - Run ESLint (must pass with 0 errors for deployment)
- `npx tsc --noEmit` - Run TypeScript type checking
- `npm run audit` - Run security audit

### Setup
- `npm run playwright:install` - Install Playwright browsers
- Create `.env.local` with Supabase credentials for local development

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Database**: Supabase (PostgreSQL) with real-time capabilities
- **UI**: Tailwind CSS with custom gradient design system
- **Charts**: Chart.js with react-chartjs-2 wrapper
- **Testing**: Jest + React Testing Library + Playwright + MSW
- **Deployment**: Vercel with GitHub Actions CI/CD

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (body-data, stats, health, app-info)
│   ├── layout.tsx         # Root layout with Japanese localization
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── BodyDataForm.tsx   # Data input form with validation
│   ├── ChartContainer.tsx # Chart.js integration with multiple chart types
│   └── StatsDisplay.tsx   # Statistics dashboard
├── lib/                   # Core business logic
│   ├── supabase-api.ts    # Database client with JST timezone conversion
│   ├── supabase.ts        # Supabase client configuration
│   └── api.ts             # Frontend API client
├── mocks/                 # MSW for testing and development
├── types/                 # TypeScript definitions
└── __tests__/             # Unit tests
```

### Key Architecture Patterns

#### Database Layer
- `SupabaseApiClient` class in `src/lib/supabase-api.ts` handles all database operations
- Automatic JST (Japan Standard Time) conversion for timestamps using `convertToJST` utility
- Type-safe API responses with `ApiResponse<T>` wrapper
- Error handling with structured error messages

#### Component Architecture
- **BodyDataForm**: Controlled form with validation, BMI auto-calculation
- **ChartContainer**: Three chart types (weight, composition, calories) with Chart.js
- **StatsDisplay**: Real-time statistics calculation and display
- All components follow the composition pattern with clear prop interfaces

#### API Routes (Next.js App Router)
- `GET/POST /api/body-data` - CRUD operations for body composition data
- `GET /api/stats` - Calculated statistics (average weight, BMI, total records)
- `GET /api/health` - Health check endpoint for monitoring
- `GET /api/app-info` - Application metadata and version info

#### Data Model
Core entity is `BodyData` interface:
```typescript
interface BodyData {
  id?: number
  date: string          // Required
  weight: number        // Required
  bmi?: number         // Auto-calculated or manual
  body_fat?: number    // Optional composition metrics
  muscle_mass?: number
  visceral_fat?: number
  calories?: number
  created_at?: string  // Auto-generated, JST converted
}
```

#### Testing Strategy
- **Unit Tests**: Jest + React Testing Library for components and utilities
- **E2E Tests**: Playwright with multi-browser support (Chrome, Firefox, Safari)
- **Visual Regression**: Automatic screenshot comparison
- **Accessibility**: Automated a11y testing with axe-core
- **API Mocking**: MSW (Mock Service Worker) for consistent test data

#### Internationalization
- Japanese-first application (`lang="ja"` in layout)
- JST timezone handling throughout the application
- Japanese date formatting with `toLocaleString('ja-JP')`

### Development Notes

#### Vercel Deployment
- `vercel.json` configuration for Next.js deployment
- Region set to `hnd1` (Tokyo) for optimal performance
- GitHub Actions with CI/CD pipeline including PR previews

#### GitHub Actions Workflow
- **ci.yml**: Runs on PRs (testing) and main pushes (deployment)
- **pr-preview.yml**: Creates preview deployments for PRs with visual/a11y testing
- Includes security scanning, type checking, and Lighthouse audits

#### Mock Data Strategy
- MSW handles API mocking for both development and testing
- Consistent mock data in `src/mocks/handlers.ts`
- Enables offline development and reliable testing

#### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=optional-ga-id
```