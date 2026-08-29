# Cartify — Homepage & Authentication UI Design Specification

This document is a complete build spec for the Cartify storefront homepage
**and** its authentication pages (Login, Register, Forgot Password, Reset
Password, Email Verification). It is written so that any AI assistant or
developer can implement the **exact same design, section by section**, with
modern animation, 3D accents, background imagery, full mobile responsiveness,
and proper loading states — without guessing.

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

- **Corners:** `rounded-xl` / `rounded-2xl` on all cards, buttons, and inputs.
- **Shadows:** soft, layered — `shadow-sm` at rest, `shadow-lg` on hover.
- **Spacing:** generous — section vertical padding `py-16` to `py-24` on desktop, `py-10` on mobile.
- **Accent color:** one primary brand color for buttons/links/badges (pick one, keep consistent — do not use more than one accent).
- **Typography:** bold, large headline weight (`font-bold`/`font-extrabold`) for hero/section titles; body text in neutral gray (`text-gray-600`).
- **Motion easing:** `ease: [0.22, 1, 0.36, 1]` (a soft "ease-out-expo" feel) for all Framer Motion transitions, duration `0.5–0.7s`.

---

## 3. Homepage Sections (in order)

### 3.1 Top Promo Bar
- Full-width thin bar above the navbar.
- Text: "Get 20% OFF on Your First Order!" + "Claim Offer" button (right-aligned on desktop, stacked/centered on mobile).
- **Animation:** slides down from `y: -40, opacity: 0` to `y: 0, opacity: 1` on initial mount.
- **Mobile:** stack text above button, center-aligned, smaller font.

### 3.2 Navbar

Cartify is a multi-vendor, multi-category marketplace, not a single-brand
store — the navbar has to support search-first shopping, category
discovery across multiple categories per product, and role-aware account
states (guest / customer / seller-pending / seller-approved). "Home / Shop /
About / Contact" (a single-brand template default) is not sufficient on its
own; About/Contact move to the footer (see 3.10) so the navbar's space goes
entirely to shopping actions.

**Structure, left to right:**
1. **Logo** (left).
2. **Categories mega-menu** (`CategoryMegaMenu.jsx`) — a "Categories" or
   "All Categories" trigger that opens a dropdown/panel on hover (desktop)
   or tap (mobile/tablet), listing top-level categories from the
   `Category` model, each optionally expanding to subcategories in columns.
   This is the single most important nav element, since it's how users
   discover products across Cartify's multi-category structure.
3. **Search bar** (`SearchBar.jsx`) — wide, prominent, ideally the visual
   center of the navbar. Optional attached category-filter dropdown
   ("All Categories ▾") to scope a search, matching the Amazon/Daraz
   pattern. This is the primary discovery method on a marketplace — give
   it more visual weight than any single nav link.
4. **Wishlist icon** — heart icon with a small item-count badge (backed by
   the existing `Wishlist` model).
5. **Cart icon** — bag icon with item-count badge.
6. **Account menu** (`AccountMenu.jsx`) — role-aware, not a static "Login"
   button once authenticated:
   - **Guest (not logged in):** "Login / Register" button.
   - **Customer:** avatar/name trigger → dropdown with My Orders, My
     Wishlist, My Addresses, Change Password, Logout.
   - **Seller — `Seller.status !== "approved"`:** same dropdown, but shows
     "Seller Application: Pending/Rejected" instead of a live dashboard
     link — never show seller tools to an unapproved seller account.
   - **Seller — `role: "seller"` AND `Seller.status === "approved"`:** same
     dropdown, plus a distinct "Seller Dashboard" link/button.

**Optional secondary elements:**
- A thin **top bar** above the main navbar (promo message, "Sell on
  Cartify" link, Track Order / Help link) — same slide-down entrance
  pattern as the existing Top Promo Bar (3.1); the two can be combined into
  one bar rather than stacking two thin bars.
- The existing **Category Strip** (3.5) still has a place directly under
  the navbar as a one-click shortcut row — it's a complement to the
  mega-menu, not a replacement: the mega-menu is for deliberate browsing,
  the strip is for fast, no-thought access to top categories from the
  homepage specifically.

**Animation:** background goes from transparent to `bg-white/80
backdrop-blur-md shadow-sm` once scrolled past ~40px (glassmorphism
effect). Mega-menu panel: fade+slide-down on open (`opacity: 0, y: -8 →
opacity: 1, y: 0`, ~0.2s), fade out on close — no bounce, this should feel
instant and utilitarian, not playful.

**Mobile:**
- Collapse the categories mega-menu and account menu into a hamburger →
  slide-in drawer from the right (`AnimatePresence` + `x: "100%" → x: 0`),
  same mechanism as before.
- **Do not hide search behind the hamburger** — keep a visible search icon
  or persistent compact search bar in the collapsed top bar at all times;
  search is the primary mobile action on a marketplace, not a secondary one.
- Consider a **bottom tab bar** (Home / Categories / Cart / Account) as an
  addition alongside the top navbar on small screens — a common, proven
  pattern on marketplace apps (Daraz, Amazon) that keeps core actions
  reachable with the thumb without repeatedly scrolling back to the top.

**Seller dashboard layout — a deliberate, separate decision:** once a user
is inside the seller dashboard (Products, Orders, Analytics, Payouts),
do **not** reuse this customer-facing `Navbar.jsx`. Real marketplaces
(Daraz, Amazon Seller Central) use a distinct `SellerLayout.jsx` with its
own nav/link set — this keeps the customer storefront's navbar focused and
avoids awkwardly cramming two different jobs into one component. This spec
covers the customer-facing navbar only; the seller layout is a separate
spec to write once the seller dashboard UI is being built.

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
- Brand blurb + social icons + 3 link columns + copyright line.
- Since About and Contact were moved out of the main navbar (see 3.2), they
  belong here: e.g. **Company** (About, Careers, Sell on Cartify), **Help**
  (Contact, Track Order, Returns & Refunds, FAQ), **Legal** (Privacy
  Policy, Terms of Service) — replacing the previous generic "Products /
  Website / Contact" column set with categories that actually fit a
  marketplace's footer.
- Static — no animation needed. Social icons: `whileHover={{ scale: 1.15 }}` only.

---

## 4. Homepage 3D Guidelines (`Hero3D.jsx`)

- Use `@react-three/fiber`'s `<Canvas>` with `@react-three/drei`'s `<Environment>` (a simple studio/city preset) for realistic lighting without manual light rigging.
- If no real product `.glb` model is available yet, use a simple procedural shape (e.g. `<Icosahedron>` or `<Torus>` from drei) with a nice material (`meshStandardMaterial` with `roughness`/`metalness` tuned for a premium look) as a placeholder — do not attempt to fabricate a realistic product mesh from nothing.
- Auto-rotate via `useFrame` incrementing rotation each frame (small increment, ~0.002–0.004 rad/frame) — keep it slow and subtle, not spinning fast.
- **Performance guardrails:**
  - Cap `pixelRatio` (`gl={{ antialias: true }}` + `dpr={[1, 2]}`) to avoid over-rendering on high-DPI phones.
  - On mobile/small viewports (`window.innerWidth < 768`), reduce canvas size and disable parallax tilt — keep only rotation.
  - Wrap the canvas in a `React.Suspense` boundary with the skeleton fallback described in 3.3.

---

## 5. Authentication Pages

All auth pages (Login, Register, Forgot Password, Reset Password, Email
Verification) share one visual system so the whole auth flow feels like a
single continuous experience rather than five disconnected screens.

### 5.1 Shared Auth Layout (`AuthLayout.jsx`)

- **Background image:** a single full-bleed lifestyle/product photograph
  (e.g. a soft-lit shopping/lifestyle scene) fixed behind every auth page,
  `bg-cover bg-center`, with a dark gradient overlay
  (`bg-gradient-to-br from-black/60 via-black/40 to-black/60`) so text and
  the form card stay readable regardless of the underlying image.
- **3D classic accent (`AuthBackdrop3D.jsx`):** a fixed, full-screen
  `@react-three/fiber` canvas layered *between* the background image and the
  form card (`z-index` order: background image → 3D canvas → gradient
  overlay → glass form card). Renders 2–3 large, slow-floating abstract
  shapes (e.g. `<TorusKnot>`, `<Icosahedron>`, `<Sphere>` from drei) at low
  opacity (`transparent material, opacity ~0.25`), gently drifting up/down
  (`useFrame` sine-wave position offset) and slowly rotating — a "classic"
  ambient 3D effect rather than an interactive product showcase.
  - Desaturated / monochrome material tint so it never competes with the
    form in the foreground.
  - Subtle parallax: shapes shift a few pixels opposite to mouse movement
    for depth, disabled entirely on touch devices.
- **Form card:** centered, `bg-white/90 backdrop-blur-xl rounded-2xl
  shadow-2xl`, max width `~420px`, floats above the background image + 3D
  layer (classic "glassmorphism over a photo" look).
- **Entrance animation:** card fades+scales in (`opacity: 0, scale: 0.95 →
  opacity: 1, scale: 1`, ~0.4s) on route mount; background image has a slow
  Ken Burns-style zoom (`scale: 1 → 1.05` over 20s, `repeat: Infinity,
  repeatType: "reverse"`) for subtle ambient motion.
- **Mobile:** the 3D canvas is **disabled** (render only the static
  background image + gradient overlay) to protect performance/battery —
  the animated background image zoom still runs, since that's CSS/GPU-cheap.
  Card becomes full-width with side padding instead of a fixed max-width.

### 5.2 Login Page
- Fields: email, password (with a show/hide toggle icon — `Eye`/`EyeOff`
  from lucide-react), "Remember me" checkbox, "Forgot password?" link.
- Primary CTA: "Log In" button, full width, accent color.
- Secondary link below the card: "Don't have an account? Register".
- **Field animation:** inputs fade+slide up in a staggered sequence
  (`staggerChildren: 0.08`) as the card mounts.
- **Validation feedback:** invalid field gets a red border + inline message
  that fades in below it; on a failed login attempt, the whole card does a
  short horizontal shake (`x: [0, -8, 8, -6, 6, 0]`, ~0.4s).
- **Submit loading state:** button label swaps to a small spinner
  (rotating icon) and the button becomes disabled/`opacity-70` until the
  request resolves.
- **Success:** brief checkmark animation on the button before navigating
  away (scale-in checkmark replacing the spinner, ~300ms) so the transition
  doesn't feel abrupt.

### 5.3 Register Page
- Fields: name, username, email, password, confirm password, phone
  (optional, clearly marked).
- **Password strength meter:** a thin animated bar beneath the password
  field that grows and shifts color (red → amber → green) live as the user
  types, reflecting the strong-password policy (length + character variety).
- Terms/privacy checkbox before the submit button is enabled.
- Same field stagger-in, validation-shake, and loading/success button
  states as Login (5.2).
- Secondary link: "Already have an account? Log in".

### 5.4 Forgot Password Page
- Single field: email. Deliberately the lightest page in the flow — no
  password strength meter, no extra fields.
- Submit button: "Send Reset Link".
- **Success state:** the form content cross-fades out and is replaced (not
  a separate page navigation) by a confirmation view: an animated mail/send
  icon (a paper-plane icon that flies up-and-fades, or a mail icon with a
  gentle pulse) + the message "If an account with that email exists, a
  reset link has been sent" — phrased identically regardless of whether the
  email actually exists, matching Cartify's no-enumeration policy.
- Link back to Login remains visible throughout.

### 5.5 Reset Password Page
- Fields: new password, confirm password — same strength meter as
  Register.
- Loaded via the emailed link's token (token itself is not shown/editable
  in the UI).
- **States to design for:**
  - Valid token → normal form as above.
  - Expired/invalid token → the form is replaced with an error state (a
    shake-in red "X" icon + "This reset link has expired or is invalid" +
    a button back to Forgot Password) — never silently show a blank or
    broken form.
  - Successful reset → checkmark success animation + short auto-redirect
    (with a visible 3–5s countdown) to the Login page.

### 5.6 Email Verification

Two distinct screens under this umbrella:

- **Pending screen** (shown right after registration): animated mail icon
  (gentle bounce/pulse loop), "Verify your email" heading, the email
  address it was sent to, and a "Resend email" button. The resend button
  shows a disabled countdown state (e.g. "Resend in 30s", counting down)
  immediately after use, re-enabling with a small pop animation once the
  cooldown ends — this prevents spam-clicking without needing any extra
  library.
- **Verification result screen** (landing page when the user clicks the
  emailed link, token in the URL):
  - Success → large animated checkmark (scale/bounce in) + "Email verified!"
    + button to continue to Login/Dashboard.
  - Failure/expired → animated "X" or warning icon (shake-in) +
    explanation + a "Resend verification email" action.
  - **Loading state while the token is being verified:** a centered
    spinner + "Verifying your email…" — never show success/failure
    instantly before the API call actually resolves.

---

## 6. Responsive Breakpoints

Follow Tailwind's defaults:

| Breakpoint | Width     | Behavior notes |
|------------|-----------|----------------|
| Base (mobile) | < 640px | Single column everywhere, hamburger nav, simplified/disabled 3D, native scroll for category strip, auth 3D backdrop disabled |
| `sm`       | ≥ 640px   | 2-column product grids begin |
| `md`       | ≥ 768px   | Hero becomes 2-column, full nav links appear, auth 3D backdrop re-enabled |
| `lg`       | ≥ 1024px  | 3–4 column product grids, full-size 3D canvas with parallax enabled |
| `xl`       | ≥ 1280px  | Max content width container (`max-w-7xl mx-auto`), largest spacing |

**General rule:** never rely on `hover` states alone for essential info on
touch devices — every hover effect (quick-view icon, "View more" reveal,
etc.) must also be reachable via a normal tap/click.

---

## 7. Loading / Rendering States

Every section or page that depends on API data (products, categories, auth
requests) must have explicit states — never just a spinner and never a
silent blank screen:

1. **Loading:** skeleton components matching the real layout (gray
   `animate-pulse` blocks for image/title/price on product sections; a
   disabled/spinner button state on forms) — same structure as the loaded
   state so there's no layout shift.
2. **Empty:** a friendly empty-state message + icon (e.g. "No products
   found yet") — never just a blank section.
3. **Error:** a short error message + a "Retry" button that re-triggers the
   fetch (product sections), or an inline/shake validation message (forms).
4. **Success:** a brief, explicit confirmation (checkmark animation,
   confirmation copy) before navigating away — never an instant, jarring
   redirect.

Suggested component: `<SectionState status="loading" | "empty" | "error" |
"success">` wrapping each data-driven homepage section, and a matching
`<FormState status="idle" | "loading" | "error" | "success">` pattern for
every auth form, so this is consistent and reusable across the whole app.

---

## 8. Suggested Component File Structure

```
src/
  components/
    layout/
      TopPromoBar.jsx
      Navbar.jsx
      CategoryMegaMenu.jsx
      SearchBar.jsx
      AccountMenu.jsx
      MobileNavDrawer.jsx
      MobileBottomTabBar.jsx
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
    auth/
      AuthLayout.jsx
      AuthBackdrop3D.jsx
      LoginForm.jsx
      RegisterForm.jsx
      ForgotPasswordForm.jsx
      ResetPasswordForm.jsx
      EmailVerificationPending.jsx
      EmailVerificationResult.jsx
      PasswordStrengthMeter.jsx
    shared/
      SectionState.jsx
      FormState.jsx
      Skeleton.jsx
  pages/
    HomePage.jsx
    LoginPage.jsx
    RegisterPage.jsx
    ForgotPasswordPage.jsx
    ResetPasswordPage.jsx
    VerifyEmailPage.jsx
```

---

## 9. Implementation Notes

- This is a **Vite + React** project — do not use `next/link`, `next/image`,
  or any other Next.js-only API. Use `react-router-dom`'s `<Link to="...">`
  and plain `<img>` tags.
- Keep 3D confined to the homepage hero and the auth background — do not
  add 3D elements to every section/page, both for performance and so those
  moments stay special rather than gimmicky.
- Every animation must respect `prefers-reduced-motion` — wrap Framer
  Motion variants so entrance animations still show content (just without
  the motion) for users with that OS setting enabled.
- Product/category data shown in this spec is placeholder — wire each
  section to the real Cartify API endpoints (`productController`,
  `categoryController`) once the visual layer is working. Similarly, auth
  forms should call the existing `authController` endpoints
  (`/register`, `/login`, `/forgot-password`, `/reset-password`,
  `/verify-email`, `/resend-verification`) already built on the backend.
- Do not introduce a form-validation library (e.g. react-hook-form, Zod) or
  any other new dependency beyond what's listed in Section 1 unless you
  explicitly decide you want one — the states and validation described here
  are achievable with plain React state.