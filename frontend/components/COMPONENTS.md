# Component Specification: Pure Living Pro

This document outlines the specifications for the core reusable components in the Pure Living Pro frontend application.

---

## 1. `<Navbar>`

**Description:** The primary application navigation bar. It is sticky, shrinks on scroll, and includes a mobile-friendly drawer.

### Props

```typescript
interface NavbarProps {
  // No props are currently required.
}
```

### Variants

-   **Default (Top of Page):** Full height (80px), transparent background with blur, larger logo and fonts.
-   **Scrolled:** Reduced height (64px), slightly more opaque background, smaller logo, prominent shadow.

### States

-   **Nav Links:**
    -   `hover`: Text color changes to `primary`, background gets a soft `primary/10` wash.
    -   `focus-visible`: A visible ring using the `primary` color.
-   **CTA Button:**
    -   Follows standard `<Button>` component states.

### Motion

-   **Shrink on Scroll:** The header's height, padding, and logo size smoothly transition over `200ms` when the user scrolls past a certain threshold (e.g., 10px).
-   **Mobile Drawer:** Slides in from the right over `250ms` with an `ease-in-out` curve. The overlay fades in simultaneously.
-   **`prefers-reduced-motion`:** All transitions are disabled. The header state changes instantly.

### Accessibility (A11y)

-   The navigation is contained within a `<nav>` element with `aria-label="Main navigation"`.
-   The mobile menu trigger is a `<button>` with `aria-label="Open menu"` and `aria-expanded` state.
-   The mobile drawer has `role="dialog"`, `aria-modal="true"`, and focus is trapped within it when open.

### Testing Notes

-   Verify that the header shrinks correctly on scroll.
-   Test keyboard navigation (Tab) through all links and buttons in both desktop and mobile views.
-   Ensure the mobile menu is fully accessible and focus is managed correctly.

---

## 2. `<Hero>`

**Description:** A large, attention-grabbing section at the top of a page, typically on the homepage.

### Props

```typescript
interface HeroProps {
  mediaType: "image" | "video" | "lottie";
  mediaSrc: string; // URL for image/video or path to Lottie JSON
  posterSrc?: string; // For video fallback
  headline: React.ReactNode;
  subhead: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
}
```

### Variants

-   This component is highly configurable via props rather than having distinct variants.

### States

-   **CTA Buttons:** Follow standard `<Button>` component states.

### Motion

-   **Text Reveal:** Headline and subhead text animates in with a gentle "fade and slide up" effect on page load.
-   **Media Background:** Can have a subtle "Ken Burns" (pan and zoom) effect on images or play video/Lottie animations.
-   **`prefers-reduced-motion`:** All text and media animations are disabled.

### Accessibility (A11y)

-   If `mediaType` is "video", it must have accessible controls or be purely decorative (`aria-hidden="true"`).
-   Text must have sufficient color contrast against the media background (using overlays).
-   The headline should be the `<h1>` for the page.

### Testing Notes

-   Test media loading and fallbacks (e.g., video poster image).
-   Verify text contrast meets WCAG AA standards.
-   Check animation performance.

---

## 3. `<InsightCard>` (formerly ArticleCard)

**Description:** A card for displaying a summary of a blog post or article.

### Props

```typescript
interface InsightCardProps {
  article: {
    slug: string;
    title: string;
    excerpt?: string;
    featuredImageUrl?: string;
    category?: { name: string };
    createdAt: Date;
    viewCount: number;
    content: string; // Used to calculate read time
    authorName: string;
  };
  featured?: boolean;
}
```

### Variants

-   **Default:** Standard card layout.
-   **Featured:** Larger size, potentially spanning multiple columns in a grid, with more prominent visuals.

### States

-   **`hover`:** Card lifts slightly (`translateY`) and a more pronounced shadow appears. The title color changes to `primary`.
-   **`focus-visible`:** A visible ring appears around the entire card.

### Motion

-   **Hover Lift:** The card lifts on hover over `200ms`.
-   **Image Zoom:** The card's image subtly zooms in on hover.
-   **`prefers-reduced-motion`:** All transforms (lift, zoom) are disabled. State changes use simple cross-fades.

### Accessibility (A11y)

-   The entire card is wrapped in a single `<a>` tag pointing to the article slug for a larger click target.
-   The image has descriptive `alt` text.
-   All text content is readable and has sufficient contrast.

### Testing Notes

-   Ensure the link covers the entire card.
-   Verify that read time calculation is accurate.
-   Check image fallbacks if `featuredImageUrl` is missing.

---

## 4. `<ProductCard>`

**Description:** A card for displaying an affiliate product with key information and a clear call-to-action.

### Props

```typescript
interface ProductCardProps {
  product: {
    slug: string;
    name: string;
    description?: string;
    benefits: string[];
    price?: string;
    imageUrl?: string;
    affiliateUrl: string;
  };
  contentId?: string; // For analytics tracking
}
```

### States

-   **Card:** Same hover/focus states as `<InsightCard>`.
-   **CTA Button:** Follows standard `<Button>` states. The CTA is an external link.

### Motion

-   **Hover Lift:** Same as `<InsightCard>`.
-   **`prefers-reduced-motion`:** Transforms are disabled.

### Accessibility (A11y)

-   The product name is a link to the internal product detail page (`/picks/[slug]`).
-   The CTA button is an `<a>` tag styled as a button, opening the affiliate link in a new tab. It includes `rel="nofollow sponsored"`.
-   The image has descriptive `alt` text.

### Testing Notes

-   Verify the product detail link and the external affiliate link go to the correct destinations.
-   Ensure the affiliate link opens in a new tab and has the correct `rel` attributes.

---

## 5. `<NewsletterForm>` (formerly EmailSignupForm)

**Description:** A form for capturing user emails for a newsletter.

### Props

```typescript
interface NewsletterFormProps {
  variant?: "inline" | "block";
  title?: string;
  description?: string;
}
```

### Variants

-   **Inline:** A compact, single-line form for placement within content.
-   **Block (Default):** A larger, more prominent component, often used in the footer or dedicated sections.

### States

-   **Input:** Standard `focus` and `hover` states. `focus-visible` shows a `primary` colored ring.
-   **Submit Button:** Standard `<Button>` states, including a `disabled` state during submission.

### Motion

-   Minimal motion. A subtle "shake" animation can occur on submission error.
-   **`prefers-reduced-motion`:** Shake animation is disabled.

### Accessibility (A11y)

-   The `<input type="email">` is correctly associated with a `<label>`.
-   Success and error messages are announced by screen readers using `aria-live` regions.

### Testing Notes

-   Test form submission with valid and invalid email formats.
-   Verify success and error states are displayed correctly.
-   Ensure no vendor-specific logic is included in the component itself.

---

## 6. `<Callout>`

**Description:** A component to highlight important information within a block of text, such as in an article.

### Props

```typescript
interface CalloutProps {
  type: "info" | "success" | "warning" | "danger";
  title?: string;
  children: React.ReactNode;
}
```

### Variants

-   **`info` (Default):** Blue accent color.
-   **`success`:** Green accent color.
-   **`warning`:** Amber/yellow accent color.
-   **`danger`:** Red accent color.

Each variant has a distinct icon, background color, and border color tied to the theme's state colors.

### States

-   This component is not interactive and has no states.

### Motion

-   No motion is applied to this component.

### Accessibility (A11y)

-   The component has `role="status"` to ensure its content is announced by screen readers.
-   The icon has `aria-hidden="true"` as it is decorative. The `type` is conveyed by the title/text.

### Testing Notes

-   Verify that all four variants render with the correct colors and icons.
-   Check that the content passed as `children` is rendered correctly.

---

*This document will be expanded as more components are developed.*
