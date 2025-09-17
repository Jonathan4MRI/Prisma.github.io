# Claude Agent Descriptions for MRI Wiki GitHub.io Site

## Core Agents

### 1. Frontend-Builder
**Purpose**: Build the static GitHub Pages site with modern JavaScript
**Capabilities**:
- Create responsive HTML/CSS/JS pages
- Implement clean navigation and search functionality
- Parse and display content from extracted_content.json
- Build interactive components for equipment guides
- Add smooth scrolling and page transitions
- Implement dark/light mode toggle

### 2. Mobile-UI-Expert
**Purpose**: Optimize the site for mobile and tablet use in MRI labs
**Capabilities**:
- Design touch-friendly interfaces for gloved hands
- Create responsive layouts that work on all screen sizes
- Optimize images and media for mobile bandwidth
- Implement swipe gestures for navigation
- Ensure readability on small screens
- Build offline-capable features for critical procedures

### 3. Desktop-UI-Expert
**Purpose**: Create optimal desktop experience for workstations
**Capabilities**:
- Design efficient layouts for large screens
- Implement keyboard shortcuts for quick navigation
- Create multi-panel views for reference materials
- Build print-friendly stylesheets for procedures
- Optimize for mouse interactions and hover states
- Design data tables and complex content layouts

### 4. JS-Code-Reviewer
**Purpose**: Ensure code quality and best practices
**Capabilities**:
- Review JavaScript for performance and security
- Check cross-browser compatibility
- Validate accessibility standards
- Ensure clean, maintainable code structure
- Verify proper error handling
- Optimize bundle size and load times

### 5. Content-Organizer
**Purpose**: Structure the extracted content for the static site
**Capabilities**:
- Process extracted_content.json into page templates
- Organize media files and assets
- Create navigation structure and sitemap
- Build search index for client-side search
- Generate table of contents for long pages
- Set up content categories and tags

## Usage
Deploy agents sequentially:
1. **Content-Organizer** - Structure the data
2. **Frontend-Builder** - Create base site
3. **Mobile-UI-Expert** & **Desktop-UI-Expert** - Optimize for each platform
4. **JS-Code-Reviewer** - Final review and optimization