# Cartify — Homepage UI Design Specification

This document is a complete build spec for the Cartify storefront homepage.
It is written so that any AI assistant or developer can implement the **exact
same design, section by section**, with modern animation, 3D accents, full
mobile responsiveness, and proper loading states — without guessing.

Reference design inspiration: GoCart (https://gocart-gs.vercel.app)

---

## 1. Tech Stack

| Purpose            | Library                                   |
|---------------------|-------------------------------------------|
| Framework           | React (Vite)                              |
| Styling             | Tailwind CSS                              |
| Icons               | lucide-react                              |
| Animation           | Framer Motion                             |
| 3D rendering        | @react-three/fiber + @react-three/drei    |
| Routing             | react-router-dom                          |
| Skeleton/loading UI | Custom Tailwind skeleton components (no extra lib required) |

Install command:

```bash
npm install framer-motion three @react-three/fiber @react-three/drei lucide-react react-router-dom
```

---

## 2. Global Design Tokens

- **Corners:** `rounded-xl` / `rounded-2xl` on all cards and buttons.
- **Shadows:** soft, layered — `shadow-sm` at rest, `shadow-lg` on hover.
- **Spacing:** generous — section vertical padding `py-16` to `py-24` on desktop, `py-10` on mobile.
- **Accent color:** one primary brand color for buttons/links/badges (pick one, keep consistent — do not use more than one accent).
- **Typography:** bold, large headline weight (`font-bold`/`font-extrabold`) for hero/section titles; body text in neutral gray (`text-gray-600`).
- **Motion easing:** `ease: [0.22, 1, 0.36, 1]` (a soft "ease-out-expo" feel) for all Framer Motion transitions, duration `0.5–0.7s`.

---

## 3. Page Sections (in order)

### 3.1 Top Promo Bar
- Full-width thin bar above the navbar.
- Text: "Get 20% OFF on Your First Order!" + "Claim Offer" button (right-aligned on desktop, stacked/centered on mobile).
- **Animation:** slides down from `y: -40, opacity: 0` to `y: 0, opacity: 1` on initial mount.
- **Mobile:** stack text above button, center-aligned, smaller font.

### 3.2 Navbar
- Logo (left) · Nav links: Home / Shop / About / Contact (center or left) · Cart icon with item-count badge + Login button (right).
- **Animation:** background goes from transparent to `bg-white/80 backdrop-blur-md shadow-sm` once scrolled past ~40px (glassmorphism effect).
- **Mobile:** collapse nav links into a hamburger menu; slide-in drawer from the right using Framer Motion (`AnimatePresence` + `x: "100%" → x: 0`).

### 3.3 Hero Section
- **Desktop:** two columns.
  - Left: eyebrow tag → headline → price teaser → CTA button. Each animates in with a staggered fade-up (`staggerChildren: 0.12`).
  - Right: a 3D canvas (`Hero3D.jsx`) rendering one auto-rotating abstract shape or placeholder product model, with subtle mouse-parallax tilt (max ~8° tilt, spring-damped).
- **Mobile:** stack vertically, 3D canvas below text, canvas height capped (~280px) and **simplified**: disable parallax tilt on touch devices, keep only the auto-rotation, to protect performance/battery.
- **Loading state:** while the 3D canvas mounts, show a skeleton pulse box (`animate-pulse bg-gray-200 rounded-2xl`) in its place until the `<Canvas>` fires its `onCreated` callback.

### 3.4 Secondary Promo Cards
- Two cards side by side (desktop), stacked (mobile): image + label ("Best products", "20% discounts") + "View more" link.
- **Animation:** `whileHover={{ scale: 1.03, y: -4 }}` with shadow transition; image gets a subtle `scale: 1.05` zoom on hover.

### 3.5 Category Strip
- Horizontally scrollable row of category pills/icons (Headphones, Speakers, Watch, Earbuds, Mouse, Decoration, …).
- **Animation:** continuous auto-scroll loop (CSS `@keyframes` translateX or Framer Motion `animate={{ x: [...] }}` with `repeat: Infinity, ease: "linear"`), pausing on hover/touch.
- Each pill: `whileInView` fade+slide-up entrance the first time it's visible, `whileHover={{ scale: 1.08 }}`.
- **Mobile:** native horizontal scroll with `overflow-x-auto snap-x snap-mandatory`, auto-scroll animation disabled (rely on touch scroll instead — auto-scrolling under a user's thumb feels broken).

### 3.6 "Latest Products" Section
- Section header + "Showing X of Y products — View more" link.
- Responsive grid: `grid-cols-2` (mobile) → `grid-cols-3` (tablet) → `grid-cols-4` (desktop).
- **Animation:** parent grid uses `staggerChildren: 0.08`; each `ProductCard` fades+slides up (`whileInView`, `viewport={{ once: true }}`).
- **Card hover:** lift (`translateY(-4px)`) + shadow-lg + image zoom (`scale-105`) + a quick-view icon (eye icon) fading in over the image.
- **Loading state:** while products fetch from the API, render 4–8 `ProductCardSkeleton` components (gray `animate-pulse` blocks matching the real card's image/title/price layout) instead of a blank grid or spinner.

### 3.7 "Best Selling" Section
- Same card + animation + skeleton pattern as 3.6, larger grid (8 items).

### 3.8 "Our Specifications" Section
- Three columns: icon + bold title + one-line description (Free Shipping / Easy Returns / 24/7 Support).
- **Animation:** each icon does a small scale+rotate entrance (`whileInView`, `scale: 0.8 → 1`, `rotate: -8deg → 0`), staggered left-to-right.
- **Mobile:** stack into a single column, reduce icon size slightly.

### 3.9 Newsletter Section
- Centered heading + subtext + email input + "Get Updates" button.
- **Animation:** button `whileHover={{ scale: 1.05 }}`, `whileTap={{ scale: 0.97 }}`; on successful submit, a brief success checkmark animation (scale+fade in) replaces the button label.

### 3.10 Footer
- Brand blurb + social icons + 3 link columns (Products / Website / Contact) + copyright line.
- Static — no animation needed. Social icons: `whileHover={{ scale: 1.15 }}` only.

---

## 4. 3D Guidelines (`Hero3D.jsx`)

- Use `@react-three/fiber`'s `<Canvas>` with `@react-three/drei`'s `<Environment>` (a simple studio/city preset) for realistic lighting without manual light rigging.
- If no real product `.glb` model is available yet, use a simple procedural shape (e.g. `<Icosahedron>` or `<Torus>` from drei) with a nice material (`meshStandardMaterial` with `roughness`/`metalness` tuned for a premium look) as a placeholder — do not attempt to fabricate a realistic product mesh from nothing.
- Auto-rotate via `useFrame` incrementing rotation each frame (small increment, ~0.002–0.004 rad/frame) — keep it slow and subtle, not spinning fast.
- **Performance guardrails:**
  - Cap `pixelRatio` (`gl={{ antialias: true }}` + `dpr={[1, 2]}`) to avoid over-rendering on high-DPI phones.
  - On mobile/small viewports (`window.innerWidth < 768`), reduce canvas size and disable parallax tilt — keep only rotation.
  - Wrap the canvas in a `React.Suspense` boundary with the skeleton fallback described in 3.3.

---

## 5. Responsive Breakpoints

Follow Tailwind's defaults:

| Breakpoint | Width     | Behavior notes |
|------------|-----------|----------------|
| Base (mobile) | < 640px | Single column everywhere, hamburger nav, simplified 3D, native scroll for category strip |
| `sm`       | ≥ 640px   | 2-column product grids begin |
| `md`       | ≥ 768px   | Hero becomes 2-column, full nav links appear |
| `lg`       | ≥ 1024px  | 3–4 column product grids, full-size 3D canvas with parallax enabled |
| `xl`       | ≥ 1280px  | Max content width container (`max-w-7xl mx-auto`), largest spacing |

**General rule:** never rely on `hover` states alone for essential info on touch devices — every hover effect (quick-view icon, "View more" reveal, etc.) must also be reachable via a normal tap/click.

---

## 6. Loading / Rendering States

Every section that depends on API data (products, categories) must have three explicit states — not just a spinner:

1. **Loading:** skeleton components matching the real layout (gray `animate-pulse` blocks for image/title/price), same grid structure as the loaded state so there's no layout shift.
2. **Empty:** a friendly empty-state message + icon (e.g. "No products found yet") — never just a blank section.
3. **Error:** a short error message + a "Retry" button that re-triggers the fetch.

Suggested component: `<SectionState status="loading" | "empty" | "error" | "success">` wrapping each data-driven section, so this pattern is reusable across Latest Products, Best Selling, and later pages (Shop, Category, Product Detail).

---

## 7. Suggested Component File Structure

```
src/
  components/
    layout/
      TopPromoBar.jsx
      Navbar.jsx
      MobileNavDrawer.jsx
      Footer.jsx
    home/
      Hero.jsx
      Hero3D.jsx
      SecondaryPromoCards.jsx
      CategoryStrip.jsx
      ProductGrid.jsx
      ProductCard.jsx
      ProductCardSkeleton.jsx
      Specifications.jsx
      Newsletter.jsx
    shared/
      SectionState.jsx
      Skeleton.jsx
  pages/
    HomePage.jsx
```

---

## 8. Implementation Notes

- This is a **Vite + React** project — do not use `next/link`, `next/image`, or any other Next.js-only API. Use `react-router-dom`'s `<Link to="...">` and plain `<img>` tags.
- Keep 3D confined to the hero only — do not add 3D elements to every section, both for performance and so the one 3D moment stays special.
- Every animation must respect `prefers-reduced-motion` — wrap Framer Motion variants so entrance animations still show content (just without the motion) for users with that OS setting enabled.
- Product/category data shown in this spec is placeholder — wire each section to the real Cartify API endpoints (`productController`, `categoryController`) once the visual layer is working.
