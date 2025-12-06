# Contributing to Pure Living Pro

Thank you for your interest in contributing! This guide provides instructions on how to add new components and sections while maintaining the integrity of our design system and codebase.

## Core Principles

Our frontend is built on a set of core principles to ensure consistency, performance, and accessibility.

1.  **Design System First:** All UI elements are derived from a central design system defined in Tailwind CSS tokens and shadcn/ui theme overrides. Always use theme variables (e.g., `bg-primary`, `text-foreground`) instead of hardcoded values.
2.  **Component-Based Architecture:** The UI is composed of reusable React components located in `frontend/components`.
3.  **Accessibility is Non-Negotiable:** All components must be accessible, following WCAG 2.1 AA guidelines. This includes keyboard navigation, ARIA roles, and sufficient color contrast.
4.  **Guarded Motion:** Animations enhance the user experience but must respect user preferences. All motion is implemented using `framer-motion` and guarded by our `useMotion` hook, which checks for `prefers-reduced-motion`.

## Adding a New Component

Follow these steps to add a new component to the project.

### 1. Create the Component File

Create your new component file inside `frontend/components/`. If it's a highly reusable, generic component, place it in `frontend/components/design-system/`.

### 2. Style with Tailwind CSS

Use Tailwind CSS utility classes for styling. Adhere strictly to the design tokens defined in `frontend/styles/globals.css`.

-   **Colors:** Use semantic color names like `bg-primary`, `text-secondary-foreground`, `border-destructive`.
-   **Spacing:** Use the defined spacing scale (multiples of 4).
-   **Typography:** Use font utilities like `font-body` or `font-display`.
-   **Radius:** Use `rounded-lg`, `rounded-xl`, etc., as defined in the theme.

### 3. Implement Motion (Optional)

If your component includes animations:

-   Import `motion` from `framer-motion`.
-   Import the `useMotion` hook: `import { useMotion } from '../providers/MotionProvider';`
-   Wrap your animation logic in a condition: `const { isReducedMotion } = useMotion();`
-   If `isReducedMotion` is `true`, provide a static, animation-free experience.

### 4. Ensure Accessibility

-   Use semantic HTML5 elements (`<nav>`, `<button>`, `<main>`, etc.).
-   Ensure all interactive elements are focusable and operable via keyboard.
-   Provide `alt` text for all images.
-   Associate labels with form inputs.
-   Use ARIA attributes where necessary to define roles and states.

### 5. Add to the UI Page (Visual Contract)

To ensure visual consistency and provide a reference for other developers, you **must** add your new component to the UI showcase page.

1.  Open `frontend/pages/UIPage.tsx`.
2.  Create a new `<section>` for your component.
3.  Render your component in all its variants and states (e.g., default, primary, destructive, hover, focus, disabled).

This page serves as our visual contract and is crucial for regression testing.

### 6. Run Local Checks

Before creating a pull request, run all local checks to ensure quality:

```bash
# Run ESLint for code quality and accessibility rules
npm run lint

# Run Playwright tests for end-to-end and smoke tests
npm run test:e2e
```

## Pull Request Process

Once you've completed the steps above, you can open a pull request. Please fill out the PR template, ensuring all checks on the checklist are met. A Vercel preview deployment will be automatically created for your PR, allowing the team to visually review your changes. The PR will be blocked from merging until all automated checks (Lighthouse, Axe, E2E tests) have passed.
