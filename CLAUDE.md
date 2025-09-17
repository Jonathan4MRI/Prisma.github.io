# CLAUDE.md - MRI Suite Wiki Development Guide

## Project Overview
Create a modern, clean, and futuristic wiki website for the Neuroscape Imaging Core MRI Suite at UCSF. The site should transform the existing poorly-structured content into an intuitive, professional resource for researchers, technicians, and staff working with MRI equipment.

## Design Requirements

### Visual Design
- **Style**: Clean, minimalist, futuristic medical interface
- **Color Scheme**: 
  - Primary: Deep space blue (#0A1628) with electric blue accents (#00D9FF)
  - Secondary: Clinical white (#FFFFFF) and light gray (#F5F7FA)
  - Accent: Medical green (#00C896) for success/active states
  - Warning: Amber (#FFA500) for cautions
- **Typography**: Modern sans-serif (Inter or SF Pro Display) with clear hierarchy
- **Layout**: Card-based design with glassmorphism effects for depth
- **Icons**: Use medical/technical iconography (brain scans, equipment, data flows)
- **Animations**: Subtle micro-interactions, smooth transitions, loading states

### User Experience
- **Navigation**: Fixed sidebar with collapsible categories, breadcrumb trail
- **Search**: Instant global search with AI-powered suggestions
- **Responsive**: Mobile-first design, works on tablets for in-lab use
- **Accessibility**: WCAG 2.1 AA compliant, high contrast mode available
- **Dark Mode**: Essential for reduced eye strain in imaging labs

## Content Architecture

### Main Categories

#### 1. Equipment Hub
- **fORP System** (Fiber-Optic Response Pad)
  - Interactive setup wizard with 3D equipment visualization
  - Real-time troubleshooting flowchart
  - Configuration presets gallery
  - Video tutorials embedded inline
  
- **MRGlasses Vision System**
  - Compatibility checker tool
  - Visual calibration guide with AR overlay mockups
  - Patient comfort tips with illustrations
  
- **Siemens Audio Systems**
  - Interactive audio level simulator
  - Safety protocol checklist with visual indicators
  - Quick reference cards for common setups

#### 2. Operations Center
- **Scanner Control**
  - Step-by-step procedures with progress tracking
  - Emergency shutdown button (prominent red)
  - System status dashboard mockup
  - Reboot/startup timing calculator
  
- **Data Management**
  - DICOM transfer wizard with drag-and-drop
  - Network diagnostics tool
  - Transfer queue visualization
  - Storage capacity monitor

#### 3. Patient & Research Support
- **Pediatric MRI Preparation**
  - Interactive preparation timeline
  - Sound sample player with volume controls
  - Virtual scanner tour (360° images)
  - Printable parent guides with QR codes
  
- **Scheduling & Resources**
  - Live equipment availability calendar
  - Resource booking interface
  - Contact directory with instant messaging
  - Protocol library with filters

#### 4. Troubleshooting Intelligence
- **Smart Diagnostic System**
  - Symptom-based problem solver
  - Error code database with search
  - Solution history tracker
  - Escalation pathway diagram
  
- **Knowledge Base**
  - FAQ with collapsible answers
  - Video solution library
  - Community-contributed fixes
  - Maintenance schedule tracker

## Technical Implementation

### Frontend Framework
Use **Next.js 14** with TypeScript for:
- Server-side rendering for fast initial loads
- API routes for backend functionality
- Image optimization
- Built-in performance monitoring

### Styling
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for animations
- **Radix UI** for accessible components
- **Custom CSS** for glassmorphism and special effects

### Data Management
- Parse `extracted_content.json` for initial content
- Store in **PostgreSQL** with full-text search
- **Prisma ORM** for database operations
- **Redis** for caching frequently accessed content

### Features to Implement

#### Core Features
1. **Global Search** with Algolia or ElasticSearch integration
2. **User Authentication** for staff access levels
3. **Version Control** for procedure updates
4. **Notification System** for equipment status changes
5. **Analytics Dashboard** for usage patterns

#### Advanced Features
1. **AI Assistant** for instant help (using OpenAI API)
2. **AR Equipment Guides** (WebXR for mobile)
3. **Real-time Collaboration** on protocols
4. **Automated Report Generation**
5. **Integration with Scanner Systems** (if APIs available)

## File Structure
```
/src
├── app/
│   ├── layout.tsx (main layout with sidebar)
│   ├── page.tsx (landing dashboard)
│   ├── equipment/
│   │   ├── forp/page.tsx
│   │   ├── mrglasses/page.tsx
│   │   └── audio/page.tsx
│   ├── operations/
│   │   ├── scanner/page.tsx
│   │   └── data/page.tsx
│   ├── support/
│   │   ├── pediatric/page.tsx
│   │   └── scheduling/page.tsx
│   └── troubleshooting/
│       ├── diagnose/page.tsx
│       └── knowledge/page.tsx
├── components/
│   ├── ui/ (reusable components)
│   ├── layout/ (navigation, headers)
│   ├── equipment/ (equipment-specific)
│   └── charts/ (data visualizations)
├── lib/
│   ├── db.ts (database connection)
│   ├── search.ts (search functionality)
│   └── utils.ts (helper functions)
└── styles/
    └── globals.css (global styles)
```

## Content Migration Strategy

### Phase 1: Data Processing
1. Parse `extracted_content.json` for all text content
2. Organize media files from `_files` directories
3. Create database schema matching new architecture
4. Import content with proper categorization

### Phase 2: Enhancement
1. Rewrite content for clarity and brevity
2. Add interactive elements to procedures
3. Create visual diagrams for complex processes
4. Optimize images and add loading states

### Phase 3: Integration
1. Connect to any available MRI system APIs
2. Implement real-time status monitoring
3. Add user feedback mechanisms
4. Deploy analytics and monitoring

## Key Pages to Prioritize

1. **Dashboard** - Overview with system status, quick actions, recent updates
2. **fORP Setup Wizard** - Most complex equipment, needs clear guidance
3. **Scanner Operations** - Critical procedures, must be foolproof
4. **Troubleshooting Hub** - Reduces support burden
5. **Child MRI Prep** - High emotional stakes, needs excellent UX

## Development Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type-check

# Database migrations
npx prisma migrate dev

# Seed database with extracted content
npm run seed
```

## Performance Targets
- **Lighthouse Score**: 95+ for all metrics
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Search Results**: < 200ms
- **Page Transitions**: < 300ms

## Security Considerations
- **Authentication**: OAuth 2.0 with UCSF credentials
- **Authorization**: Role-based access control (Admin, Technician, Researcher)
- **Data Protection**: Encryption at rest and in transit
- **Audit Logging**: Track all system changes
- **HIPAA Compliance**: No patient data stored

## Monitoring & Analytics
- **Sentry** for error tracking
- **Vercel Analytics** for performance
- **Custom dashboard** for usage patterns
- **Feedback widget** on every page
- **A/B testing** for UI improvements

## Future Enhancements
1. **Mobile App** for on-the-go access
2. **Voice Commands** for hands-free operation
3. **Machine Learning** for predictive troubleshooting
4. **Virtual Reality** training modules
5. **IoT Integration** with scanner sensors

## Success Metrics
- Reduce average troubleshooting time by 50%
- Increase self-service resolution rate to 80%
- Achieve 90% user satisfaction rating
- Decrease training time for new staff by 40%
- Zero critical procedure errors due to documentation

## Notes for Development
- All existing content is available in `extracted_content.json`
- Media files are preserved in original `_files` directories
- Prioritize mobile experience for in-lab tablet use
- Ensure offline capability for critical procedures
- Build with accessibility as a core requirement, not an afterthought
- Test with actual MRI technicians for usability feedback
- Consider bandwidth limitations in scanner rooms
- Plan for multi-language support (start with English)

## Contact & Resources
- Original content: 12 HTML pages, 375 media files
- Extracted data: `extracted_content.json` (450KB)
- Current issues: Poor navigation, outdated design, no search
- Target users: MRI technicians, researchers, support staff
- Environment: UCSF Neuroscape Imaging Core facility