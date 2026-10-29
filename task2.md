# Redesign AI Resume Analyzer UI Using Google Stitch MCP

## Objective

The current AI Resume Analyzer looks like a basic HTML page and lacks a professional, visually appealing user interface.

I want you to **completely redesign the existing frontend into a modern, premium-quality SaaS application** using Google Stitch through the already-connected MCP integration.

This is a UI/UX redesign of the existing project. Preserve the existing backend, AI analysis pipeline, APIs, database, authentication, and business logic. Improve the frontend design and user experience without breaking working functionality.

**Do not just suggest a design, create screenshots, or generate a static mockup. Design the screens using Google Stitch, then implement the actual working UI in the existing codebase.**

---

## 1. First: Inspect the Existing Project

Before making changes:

1. Inspect the entire frontend project structure.
2. Identify the current framework, dependencies, routes, pages, and reusable components.
3. Understand the existing API integrations, authentication flow, data models, and analysis response structure.
4. Identify why the application currently renders like a basic HTML page.
5. Check the installed Google Stitch MCP tools and their available capabilities.
6. Read the relevant MCP tool descriptions and schemas before invoking them.

Do not replace the entire project blindly or introduce an unnecessary framework migration.

Keep all existing working functionality intact.

## 2. Use Google Stitch MCP for Design

Use the connected Google Stitch MCP as the primary UI design tool.

### Required workflow

1. Use Stitch to establish a consistent visual direction for the application.
2. Create high-quality screen designs for the major application pages.
3. Design the actual layouts, navigation, cards, tables, forms, typography, spacing, colors, and interaction states.
4. Reuse a consistent design system across all screens.
5. Use the resulting designs as the reference for frontend implementation.
6. Implement the designs in the existing React application.
7. Compare the implemented pages against the Stitch designs and refine them.

If the Stitch MCP supports generating frontend code, reusable assets, or design references, use the available capabilities appropriately.

Do not assume that generating a design in Stitch automatically updates the application's source code. Explicitly implement the designs in the repository.

If a particular MCP capability is unavailable, use the closest supported Stitch workflow and continue with the implementation.

---

## 3. Desired Visual Direction

Create a professional, polished AI SaaS product that looks like a real commercial application rather than a college project or a plain HTML dashboard.

### Design style

- Premium modern SaaS dashboard.
- Clean, structured layouts with excellent visual hierarchy.
- Elegant typography and generous whitespace.
- Carefully designed cards, borders, shadows, and rounded corners.
- Subtle gradients used selectively.
- High-quality icons rather than emoji used as interface icons.
- Consistent spacing and alignment.
- Beautiful empty states, loading states, and success/error feedback.
- Clear visual differentiation between primary and secondary actions.
- Responsive layouts for desktop, tablet, and mobile.

### Suggested palette

Use a sophisticated light theme as the primary design:

- Background: soft off-white or very light cool gray.
- Main surfaces: white.
- Primary accent: deep indigo or electric violet.
- Secondary accent: subtle blue.
- Primary text: dark slate.
- Secondary text: muted gray.
- Borders: light neutral gray.
- Success: restrained green.
- Warning: amber.
- Error: muted red.

Use colors intentionally. Avoid excessive gradients, neon colors, unnecessary glassmorphism, or too many competing accent colors.

### Typography

Use a modern, readable typeface such as Inter, Geist, or an equivalent available font.

Create a clear type scale for:

- Page titles.
- Section headings.
- Card headings.
- Body text.
- Supporting text.
- Labels.
- Table content.
- Score values and metrics.

### Visual quality target

The application should feel comparable in polish to a well-designed modern SaaS analytics dashboard.

Prioritize consistency, usability, clarity, and visual quality over decorative effects.

---

## 4. Required Screens to Design and Implement

### A. Landing Page

Create a compelling landing page with:

- Professional navigation bar.
- Product logo and branding.
- Hero section with a clear headline.
- Supporting description explaining AI-powered resume-to-JD matching.
- Primary CTA: "Analyze Resume".
- Secondary CTA: "Explore for Recruiters".
- A visually appealing preview of the actual analysis dashboard.
- Feature sections explaining project-aware skill matching, explainable scoring, and evidence-based analysis.
- Separate sections for candidates and recruiters.
- A simple process explanation.
- Footer with relevant navigation and links.

Avoid generic marketing templates. The landing page should communicate the product's unique value clearly.

### B. Candidate Dashboard

Design a polished dashboard containing:

- Sidebar navigation.
- Welcome section.
- Resume analysis CTA.
- Recent analyses.
- Average match score, where supported by real data.
- Resume and JD management.
- Analysis history.
- Empty state for new users.
- Clear actions to start a new analysis.

Do not invent dashboard metrics. Display empty states or calculated values based on actual application data.

### C. HR / Recruiter Dashboard

Include:

- Recruiter navigation.
- Job descriptions and role management.
- Total analyzed candidates, based on actual data.
- Recent analyses.
- Candidate comparison entry point.
- Candidate lists with scores and status labels.
- Filters, search, and sorting.
- Shortlisting actions.

Keep the interface information-dense enough for HR workflows while maintaining readability.

### D. Resume and JD Upload Page

This is a critical screen.

Build an elegant analysis setup experience with:

- Resume upload area with drag-and-drop support.
- PDF and DOCX file support.
- File name, file size, upload progress, and removal controls.
- JD text editor.
- Optional JD file upload if supported by the backend.
- Job title and company fields where appropriate.
- Clear file validation messages.
- Primary "Analyze Resume" button.
- Helpful upload instructions.
- Loading and processing states.

Make the flow intuitive and easy to complete.

If the backend supports uploading multiple resumes, provide a separate recruiter workflow for batch analysis rather than cluttering the candidate upload experience.

### E. Analysis Results Dashboard

This is the most important screen in the product.

Design a premium analytics interface with the following sections.

**Top summary area**

- Candidate or resume title.
- Target job title.
- Overall match score out of 10.
- Score interpretation.
- Evidence coverage and analysis confidence, if available.
- Download report action.
- Analyze another resume action.

Use an attractive score visualization, such as a circular progress indicator or a well-designed score card.

**Key insight cards**

- Direct matches.
- Project-derived matches.
- Partial matches.
- Missing or unverified requirements.

These must be calculated from actual analysis results.

**Detailed analysis sections**

Create well-organized tabs or navigation sections for:

1. Overview.
2. Skills Match.
3. Project Analysis.
4. Direct Findings.
5. Indirect Findings.
6. Missing Requirements.
7. Resume Improvements.
8. Interview Questions.

Use clear status labels, compact visual indicators, and expandable evidence panels.

### F. Skills Match Page

Show a comprehensive JD requirement matrix with:

- Requirement name.
- Mandatory or preferred status.
- Match classification.
- Evidence strength.
- Source section.
- Supporting resume excerpt.
- Explanation of relevance.

Provide filtering by match status and requirement importance.

Use a responsive table on desktop and well-designed cards on mobile.

### G. Project Analysis Page

Give each project its own attractive card or expandable detail view.

Show:

- Project name.
- Project relevance score out of 10.
- Technologies identified.
- Related JD requirements.
- Technical implementation depth.
- Evidence excerpts.
- Indirectly demonstrated capabilities.
- Missing implementation details.
- Improvement suggestions.

Use technology chips and structured content sections.

Do not display a technology as confirmed if the analysis only inferred a possible relationship.

### H. Candidate Comparison Page

For recruiters, design a clear candidate comparison interface.

Show:

- Candidate name or resume identifier.
- Overall match score.
- Mandatory skills coverage.
- Project relevance.
- Direct and project-derived matches.
- Unverified requirements.
- Shortlist action.

Provide sorting, filtering, and an accessible comparison layout.

Ensure that all values come from actual analyses.

### I. Analysis History

Create a professional history page with:

- Search.
- Filters.
- Resume name.
- Target JD.
- Match score.
- Analysis date.
- View results.
- Download report.
- Delete action, with confirmation.

### J. Authentication and Onboarding

If authentication already exists, redesign its UI without changing the authentication implementation.

Create polished:

- Login page.
- Registration page.
- Password recovery page if supported.
- Role selection or onboarding screen if required.

Use clear forms, accessible validation, and useful error messages.

---

## 5. Build a Consistent Design System

Use reusable design tokens and components.

Create or update:

- Color variables.
- Typography tokens.
- Spacing scale.
- Border radius scale.
- Shadows.
- Buttons.
- Inputs.
- Dropdowns.
- Cards.
- Dialogs.
- Tabs.
- Badges.
- Tooltips.
- Tables.
- Progress indicators.
- Loading skeletons.
- Toast notifications.
- Empty states.
- Sidebar and top navigation.

Use a consistent icon library such as Lucide.

Do not use Unicode characters or emoji as substitutes for professional interface icons.

Avoid repetitive one-off CSS styles when a reusable component or design token is appropriate.

---

## 6. Technical Implementation Requirements

Use the existing frontend framework and architecture.

If the project already uses React, Vite, TypeScript, and Tailwind CSS, continue using them.

Implement:

- Responsive layouts.
- Reusable components.
- Proper route handling.
- Functional navigation.
- Accessible form controls.
- Real API integration.
- Correct loading and error states.
- Data-driven dashboards.
- Real file uploads.
- Working analysis submission.
- Actual analysis results.
- Functional tabs, filters, search, and sorting.
- Report downloads when supported.
- Confirmation dialogs for destructive actions.

Use the existing backend APIs and database.

Do not hardcode fake candidate records, fabricated scores, fake analysis reports, or fake dashboard metrics.

If a feature has no backend support, clearly identify the limitation and implement an appropriate empty state or explain the required integration.

Keep the code maintainable and avoid putting the entire application into one large component.

---

## 7. Important: Make the UI Visually Complete

The application must not look like unstyled HTML.

Specifically, inspect and fix:

- Missing or ineffective CSS.
- Incorrect Tailwind configuration.
- Missing stylesheet imports.
- Broken asset paths.
- Incorrect component styles.
- Default browser margins and typography.
- Broken layout containers.
- Missing icon rendering.
- Inconsistent button and form styles.
- Poor spacing and alignment.
- Sidebar layout problems.
- Horizontal overflow.
- Inconsistent page widths.
- Unstyled tables.
- Raw JSON being displayed directly to users.
- Loading states that leave the page looking broken.

Use a consistent application shell with navigation, a centered or appropriately constrained content area, and a coherent visual hierarchy.

Every page should feel like part of the same product.

---

## 8. Responsive Design and Accessibility

Test the application at:

- Large desktop: 1440px.
- Standard laptop: 1280px.
- Tablet: 768px.
- Mobile: 390px.

Requirements:

- No unintended horizontal scrolling.
- Sidebar collapses appropriately on smaller screens.
- Cards stack correctly.
- Tables become scrollable or transform into mobile-friendly cards.
- Buttons remain accessible.
- Forms are usable on touch screens.
- Text remains readable.
- Keyboard navigation works.
- Focus states are visible.
- Inputs have proper labels.
- Color contrast meets accessibility expectations.

---

## 9. Implementation and Verification Workflow

Follow this sequence.

### Step 1: Audit

Inspect the existing application and identify the cause of its basic appearance.

### Step 2: Design in Stitch

Use the connected Google Stitch MCP to create the design direction and major screen layouts.

### Step 3: Establish the Design System

Define typography, colors, spacing, reusable components, navigation, and layout conventions.

### Step 4: Implement the Application Shell

Build the main navigation, sidebar, page container, and shared components.

### Step 5: Implement All Major Screens

Start with:

1. Candidate dashboard.
2. Resume and JD upload.
3. Analysis results dashboard.
4. Skills and project analysis.
5. Recruiter dashboard.
6. Candidate comparison.
7. Analysis history.
8. Landing and authentication pages.

Reuse existing routes and components where appropriate.

### Step 6: Connect Real Data

Verify that each page uses the existing APIs and actual backend response data.

Preserve the resume analysis functionality and explainable scoring system.

### Step 7: Run the Application

Start the frontend and backend using the project's existing instructions.

Resolve all build errors, runtime errors, missing styles, and broken routes.

### Step 8: Visual Verification

Use the available browser or computer-use capabilities to inspect the actual rendered pages.

Check screenshots or rendered views against the Stitch designs.

Look specifically for:

- Basic or unstyled HTML appearance.
- Inconsistent spacing.
- Misaligned elements.
- Poor typography.
- Broken responsive behavior.
- Overflow.
- Incomplete sections.
- Incorrect colors.
- Unreadable analysis results.

Fix the issues and inspect the pages again.

Do not stop after the first successful build.

---

## 10. Definition of Done

The task is complete only when:

- Google Stitch MCP has been used for the design workflow.
- The major screens have a consistent, polished visual design.
- The designs have been implemented in the actual source code.
- The app no longer resembles a basic HTML page.
- The candidate and recruiter experiences are visually distinct where appropriate.
- Resume upload and JD submission still work.
- Existing analysis results display correctly.
- Direct and indirect evidence remains clearly distinguishable.
- The score and analysis data come from the real backend.
- Navigation, tabs, filters, and actions work.
- The interface is responsive.
- No critical console errors or build failures remain.
- The implemented UI has been visually inspected and refined.

## Final Instruction

Take ownership of the redesign.

**Use Google Stitch MCP to design the product, implement those designs in the existing application, run the application, inspect the actual UI, and refine it until it looks like a polished, production-quality AI SaaS product.**

Do not stop at a design proposal, a Stitch prototype, or a list of recommendations. Make the changes directly in the project and report which screens were redesigned, which files were changed, and what was tested.