# Fix AI Resume Analyzer UI — Layout, Responsiveness and Visual Polish

## Objective

The current AI Resume Analyzer frontend has a serious layout problem. The page renders with most content squeezed into the left side of the screen, leaving a huge empty area on the right. Some sections appear clipped or partially hidden, the content widths are inconsistent, and the overall page does not use the available viewport properly.

I have provided screenshots of the actual running application at `localhost:5173`. Use these screenshots as the reference for identifying and fixing the problems.

**Your task is to debug and fix the existing frontend implementation. Do not simply generate another design or replace the page with a new static mockup.**

Use the connected Google Stitch MCP if useful for refining the layouts, but prioritize fixing the actual source code responsible for the broken rendering.

## 1. Critical Issues to Fix

### A. Fix the Full-Width Layout

Currently, the main page occupies only the left portion of the viewport.

- Make the main application and page sections use the available viewport width.
- Remove unintended fixed widths, narrow `max-width` values, and restrictive containers.
- Inspect parent wrappers and nested containers for incorrect width constraints.
- Ensure the landing page has a consistent, centered content container.
- Use responsive horizontal padding instead of hardcoded positioning.
- Make the hero, feature sections, candidate/recruiter cards, workflow section, and footer align consistently.
- Ensure the right side of the viewport is not left blank because of a CSS layout error.

Use a centered max-width container only where appropriate for readability. Full-width backgrounds and navigation should span the viewport, while inner content should be centered.

### B. Fix Hero Section Alignment

The hero headline is extremely large and wraps awkwardly. The dashboard preview is also restricted to the left side.

Fix the following:

- Center the hero section within the available page width.
- Use a responsive headline with `clamp()` rather than a fixed oversized font.
- Set an appropriate maximum text width.
- Balance headline, supporting description, CTA buttons, and trust indicators.
- Keep line lengths readable.
- Ensure the dashboard preview is centered and sized proportionally.
- Prevent the dashboard preview from overflowing its container.
- Remove unnecessary fixed heights and absolute positioning that cause clipping.

The hero should look impressive without consuming the entire first screen.

### C. Fix Feature Cards and Grid Layouts

The candidate and recruiter cards, feature cards, and workflow steps must align properly.

- Use CSS Grid or Flexbox with responsive column definitions.
- Use two equal-width columns for candidate/recruiter cards on desktop.
- Use three columns for feature cards when appropriate.
- Use four columns for the four workflow steps on sufficiently wide screens.
- Ensure consistent card padding, height, gaps, borders, and alignment.
- Allow cards to stack on smaller screens.
- Prevent text, buttons, or icons from escaping their card boundaries.
- Remove unnecessary fixed widths from individual cards.

Example responsive grid:

```css
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  width: 100%;
}

@media (max-width: 900px) {
  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .feature-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

Adapt this pattern to the existing components and design system.

### D. Fix Section Spacing and Clipping

Some sections overlap or appear partially hidden behind neighboring content.

Inspect:

- Negative margins.
- Absolute positioning.
- Fixed heights.
- Incorrect `overflow: hidden`.
- Excessive `transform` values.
- Incorrect `z-index` values.
- Sticky headers and footer positioning.
- Collapsed margins.
- Incorrect viewport-height calculations.

Ensure that:

- Each section has sufficient vertical spacing.
- Headings are not clipped by the navigation bar.
- Buttons and card content remain fully visible.
- The page scrolls naturally.
- The footer follows the document content rather than covering it.
- Decorative background effects do not hide or obstruct interactive content.

Do not solve clipping by hiding overflow indiscriminately. Fix the underlying layout.

### E. Fix the Navigation Bar

The navigation should span the full viewport width.

- Keep the logo and product name aligned to the left.
- Keep sign-in and registration actions aligned to the right.
- Use consistent horizontal padding.
- Ensure the navigation does not overlap the page content.
- Implement a responsive mobile navigation.
- Keep the navigation height and spacing consistent.
- Ensure buttons remain visible and clickable.

### F. Fix the Dashboard Preview

The dashboard preview in the hero currently occupies only a portion of the page and looks disproportionately small compared with the hero text.

- Center the preview in its intended container.
- Give it a responsive width.
- Preserve the intended aspect ratio.
- Make internal cards and metrics fit correctly.
- Use consistent padding and typography.
- Prevent the preview from being cropped horizontally.
- Ensure that decorative browser-frame elements do not create unwanted overflow.

If the preview contains illustrative sample data, clearly treat it as demo content rather than actual user statistics.

## 2. Diagnose the Root Cause Before Changing CSS

Do not blindly add more CSS overrides.

Inspect the existing source code and identify the exact cause of the broken layout.

Check for:

- `width: 50%`, fixed pixel widths, or restrictive `max-width` values on outer containers.
- Incorrect `grid-template-columns`.
- Flex children with inappropriate `flex-basis` or `flex-shrink`.
- Parent elements with unintended width constraints.
- Incorrect `100vw` calculations combined with padding.
- Tailwind classes such as `w-1/2`, `max-w-*`, `container`, or fixed width utilities applied to the wrong elements.
- Global styles overriding component styles.
- Missing or incorrectly imported stylesheets.
- CSS selectors accidentally affecting unrelated sections.
- Incorrect positioning or layout assumptions inherited from the Stitch-generated implementation.

If Tailwind CSS is used, inspect the actual compiled styles and class names. If regular CSS is used, inspect the cascade and specificity.

Find the root cause and fix it at the correct component or layout level.

## 3. Establish Consistent Page Layout Rules

Create or update reusable layout components and styles.

Recommended principles:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  width: 100%;
  min-height: 100%;
}

body {
  width: 100%;
  min-height: 100vh;
  margin: 0;
}

#root {
  width: 100%;
  min-height: 100vh;
}

.page-container {
  width: min(100% - 3rem, 1280px);
  margin-inline: auto;
}

.section {
  width: 100%;
  padding-block: clamp(3rem, 6vw, 6rem);
}
```

These are starting guidelines, not instructions to override the entire existing stylesheet without inspection. Adapt them to the existing architecture.

Use a consistent spacing scale and apply it across all sections.

## 4. Responsive Breakpoints

Verify the actual rendered layout at these viewport sizes:

- 1920px: large desktop.
- 1440px: standard desktop.
- 1280px: laptop.
- 768px: tablet.
- 390px: mobile.

Expected behavior:

**Desktop**
- Full-width navigation.
- Centered page content.
- Properly distributed grid layouts.
- Balanced hero and dashboard preview.
- No unexplained empty half-screen.

**Tablet**
- Appropriate container padding.
- Feature grids adapt to available space.
- No overlapping columns.
- Navigation remains usable.

**Mobile**
- Single-column content where appropriate.
- Headline scales down naturally.
- CTA buttons fit the viewport.
- Cards use the available width.
- Navigation collapses appropriately.
- No horizontal scrolling.
- No clipped text or controls.

## 5. Preserve the Existing Visual Identity

Keep the current dark SaaS visual direction:

- Near-black background.
- Purple accent colors.
- Subtle gradients and glows.
- Clear typography.
- Rounded cards.
- Restrained borders.
- Professional iconography.

Do not redesign the brand unnecessarily. The goal is to correct the layout and improve visual balance while retaining the existing design direction.

Reduce oversized typography, excessive glow effects, and unnecessary decorative elements if they harm readability.

## 6. Implementation Requirements

- Inspect the existing React components and stylesheets.
- Modify the actual source files.
- Reuse existing components where possible.
- Avoid duplicating CSS rules or accumulating conflicting overrides.
- Preserve all existing routes and application functionality.
- Keep real API integrations and analysis logic unchanged.
- Do not replace working components with static HTML.
- Do not introduce fake statistics or fabricated analysis results.
- Do not use arbitrary absolute positioning to force elements into place.
- Do not fix desktop while breaking mobile.
- Keep the implementation maintainable.

If the problem originates in a shared layout or global stylesheet, fix it there instead of applying isolated patches to every page.

## 7. Run and Visually Verify the Fix

After implementing the changes:

1. Start the existing frontend development server.
2. Open the actual application in the browser.
3. Inspect the landing page from the top to the footer.
4. Verify that the content spans and uses the viewport correctly.
5. Inspect the hero, feature cards, workflow steps, CTA section, and footer.
6. Test the layout at the specified desktop, tablet, and mobile widths.
7. Inspect the browser console for errors.
8. Fix any remaining clipping, overflow, misalignment, or spacing problems.
9. Repeat the visual inspection after making corrections.

Do not claim success simply because the app compiles.

## Definition of Done

The task is complete when:

- The page uses the full available viewport correctly.
- The huge blank area on the right is resolved.
- Main content is centered and proportioned correctly.
- The hero heading has a balanced size and line length.
- All feature cards and workflow steps align properly.
- No sections overlap or get clipped.
- Navigation and footer display correctly.
- The UI works at desktop, tablet, and mobile sizes.
- Existing application functionality remains intact.
- The actual running application has been visually inspected after the changes.

**Final instruction: Identify the root cause of the broken layout, fix the actual implementation, run the application, and verify the result visually. Do not stop after editing CSS or describing the proposed changes.**