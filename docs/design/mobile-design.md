# Mobile Design — Chowly
Status: Draft
Last updated: 2026-09-21

## Product
- **Audience:** Customers ordering food delivery; riders fulfilling deliveries. Single Expo app, role-based routing.
- **Primary job:** Browse nearby restaurants, order food with customization, pay, and track delivery in real time.
- **Platforms:** iOS and Android via Expo (SDK 57).
- **Core flow:** Splash → Welcome → Sign Up → Add Address → Home → Restaurant → Cart → Checkout → Confirmation → Tracking → Review.
- **Activation moment:** First order placed and confirmed.
- **Locked requirements:** Green brand color (Deliveroo-inspired), green top header with delivery address, white curved content area below, bottom sheet for address selection, Google Maps integration, Stripe payment, Socket.IO real-time tracking.
- **Exclusions:** No onboarding carousel, no paywall, no subscription, no tutorial walkthrough.

## Direction

### Tone and reference influence
Confident, fresh, and appetizing. Inspired by Deliveroo's layered green-header-over-white-card architecture. The app should feel fast, trustworthy, and food-forward — high-quality imagery drives browsing decisions. Clean and functional, never cluttered.

### Background
**Split composition:** Solid green header (top 20–25% of screen) with a smooth concave curve where it meets the white content surface. The white surface contains all browsable content and feels elevated with subtle shadow at the curve junction. The green header carries the delivery address bar, greeting, and search entry point.

### Colour roles

| Role | Light | Dark | Usage |
|---|---|---|---|
| **brand** | `#00B37A` | `#00D68F` | Header fills, primary CTAs, active tab icon, progress indicators |
| **brand-dark** | `#00875A` | `#00B37A` | Pressed states, status bar tint |
| **surface** | `#FFFFFF` | `#1A1A2E` | Main content surface, cards |
| **surface-raised** | `#F7F7F7` | `#222240` | Category chips, input backgrounds, secondary cards |
| **on-surface** | `#1A1A2E` | `#F0F0F5` | Primary text |
| **on-surface-muted** | `#6B7280` | `#9CA3AF` | Secondary text, labels, timestamps |
| **on-brand** | `#FFFFFF` | `#FFFFFF` | Text/icons over brand fills |
| **accent-warm** | `#FF6B35` | `#FF8A5C` | Promotions, discount badges, promo banners |
| **accent-star** | `#FFB800` | `#FFCB45` | Star ratings |
| **error** | `#E53E3E` | `#FC5A5A` | Validation errors, rejected orders |
| **success** | `#00B37A` | `#00D68F` | Confirmed states, delivered badge |
| **border** | `#E5E7EB` | `#2D2D4A` | Card borders, dividers |

### Typography
- **Family:** Inter (Google Fonts, already in Expo ecosystem)
- **Display:** 28pt / bold — screen titles on green header
- **Heading:** 20pt / semibold — section headings ("Nearby restaurants")
- **Subhead:** 16pt / semibold — card titles, restaurant names
- **Body:** 14pt / regular — descriptions, menu item details
- **Caption:** 12pt / medium — labels, timestamps, delivery estimates
- **Numeric:** Inter with tabular figures — prices, ratings, distances, times

### Spacing, radii, borders, elevation
- **Base unit:** 4px. Scale: 4, 8, 12, 16, 20, 24, 32, 40.
- **Card radius:** 16px. Chip radius: 20px (pill). Button radius: 12px. Input radius: 12px. Bottom sheet radius: 24px (top corners only).
- **Header curve:** Large concave arc (~40px radius) forming the transition from green header to white surface.
- **Elevation:** Cards use `0 2px 8px rgba(0,0,0,0.06)`. Bottom sheets use `0 -4px 24px rgba(0,0,0,0.12)`. Green header has no shadow — the curve creates the separation.
- **Borders:** 1px `border` color on cards in light mode; no visible border in dark mode (elevation suffices).

### Icons and imagery
- **Icons:** Outline style, 24px, 1.5px stroke. Filled variant for active tab state only.
- **Food imagery:** Full-bleed on restaurant cards (aspect 16:9 crop), rounded 12px on menu item thumbnails (64×64). Always show real food photography — never illustrations for food items.
- **Restaurant logos:** 48×48 circle with 1px border.
- **Category icons:** 40×40, simple outline illustrations (burger, pizza, sushi, salad, coffee, etc.) inside chips or circular backgrounds.

### Motion character
- **Screen transitions:** Shared element transitions on restaurant card → detail. Standard push for auth stack.
- **Content choreography:** Home content fades + slides up in sequence: greeting → search → categories → featured → nearby (stagger 50ms).
- **Bottom sheets:** Spring animation, drag-to-dismiss with velocity threshold.
- **Cart bar:** Slides up from bottom with spring when first item added; bounces subtly on item count change.
- **Micro-interactions:** Heart icon scales on tap (favorites). Add-to-cart button has brief scale pulse. Pull-to-refresh uses brand-colored spinner.
- **Reduced motion:** All content appears immediately, no stagger, sheets snap without spring.

### Accessibility
- All text meets WCAG AA contrast against its background. White text on `#00B37A` passes at 16pt+ bold; use `#00875A` for smaller text on white.
- Touch targets minimum 44×44pt.
- All icons have accessibility labels.
- Screen reader announces order status changes.

---

## Screen inventory

### Flow 1 — Auth (unauthenticated)

1. **Splash** — Chowly logo centered on solid brand-green background. Animated logo subtle scale-up (0.95→1.0) over 600ms. Auto-navigates on auth check completion.

2. **Welcome** — Full-screen brand-green background. Chowly logo top-center. Hero food illustration or photo (delivery bag with fresh food, warm tones) centered. Headline: "Fresh food, delivered fast." Subline: "Order from the best restaurants near you." Primary CTA: "Continue with Email" (white pill button). Secondary: "Continue with Google" (outlined white pill) — taps show alert: "Google Sign-In coming soon!" Bottom text link: "Already have an account? Log in."

3. **Sign Up** — White surface. Back arrow top-left. Title: "Create your account." Fields: Full name, Email, Phone, Password (with show/hide toggle). Each field has real-time Zod validation with error text below. Primary CTA: "Continue" (brand-green pill, full-width, bottom-anchored). Keyboard-aware scroll. Below CTA: "Already have an account? Log in" link.

4. **Log In** — White surface. Back arrow. Title: "Welcome back." Fields: Email, Password (show/hide). Primary CTA: "Log In." Below: "Don't have an account? Sign Up" link. Forgot password link below password field.

5. **Add Address** — White surface. Title: "Where should we deliver?" Google Places autocomplete search input at top with magnifying glass icon. Below: map preview (Google Maps, 200px height, rounded 16px) showing selected pin. Address confirmation card below map with full address text, edit icon. Label selector chips: "Home", "Work", "Other." Primary CTA: "Confirm Address" (brand-green, bottom-anchored). Skip option if user wants to set later (text link).

### Flow 2 — Customer (authenticated, role: customer)

6. **Home** — The signature screen.
   - **Green header zone** (top ~25%): Status bar tinted brand-dark. Greeting: "Hey, [First Name] 👋" (white, 16pt semibold). Below: delivery address row — pin icon + "Delivering to [Address Label]" (white, 14pt) + chevron-down icon. Tapping this row opens the **Address Bottom Sheet** (screen 6a). Below address: search bar (white rounded pill, 44pt height, placeholder: "Search restaurants or dishes", magnifying glass icon left-aligned). The green area ends with the concave curve into white.
   - **White content zone**: Horizontal scrolling category chips (icon + label, pill shape, `surface-raised` bg, `on-surface` text, selected state: `brand` bg + `on-brand` text). Chips: "All", "Fast Food", "Pizza", "Sushi", "Healthy", "Coffee", "Desserts". Below: "Featured" section heading with horizontal carousel of featured restaurant cards (large: cover image 16:9, restaurant name, cuisine tags, rating stars + count, delivery time + fee). Below: "Nearby Restaurants" heading with vertical list of restaurant cards (horizontal layout: 100px square image left, name + cuisine + rating + delivery time + fee right). Paginated with pull-to-refresh. Floating cart bar appears at bottom when cart has items.

   6a. **Address Bottom Sheet** — Slides up from bottom, 24px top radius, drag handle. Title: "Delivery address." List of saved addresses with radio selection (label, full address, default badge). "Add new address" row at bottom with + icon. Selecting an address dismisses sheet and updates header.

7. **Restaurant Detail** —
   - Collapsing header: Restaurant cover image (full-width, 240px) with gradient overlay at bottom. Back button and heart (favorite) icon overlaid top. Restaurant info overlay: name (20pt bold white), cuisine tags, rating (star + number + review count), delivery time estimate, delivery fee.
   - Below header: Sticky category tab bar (horizontal scroll, underline indicator in brand color). Scrollable menu organized by category. Each category: heading + item cards.
   - **Menu item card:** Horizontal row — left: name (subhead), description (body, 2-line clamp, muted), price (subhead, brand color). Right: 64px square food image, rounded 12px. Tap opens item detail bottom sheet.

   7a. **Item Detail Bottom Sheet** — Large food image top (full-width inside sheet, 200px, rounded top). Item name, description, base price. Variant/option groups listed vertically: group name + required badge, radio (single-select) or checkbox (multi-select) options with price modifier ("+ $1.50"). Quantity selector (– / count / +) at bottom. "Add to Cart — $X.XX" CTA button (brand-green, shows calculated total).

8. **Cart** — White surface. Title: "Your cart." Restaurant name sub-header with restaurant icon. Cart items list: item name, selected options summary (caption), quantity controls (–/+), line total. Divider. Subtotal, delivery fee (with distance note), promo code input row (text input + "Apply" button, collapses to applied badge with code + remove icon on success), discount line (if applied, accent-warm color), total (bold). Delivery address summary row (tap to change). Primary CTA: "Go to Checkout — $XX.XX" (brand-green, bottom-anchored). Empty state: illustration of empty bag, "Your cart is empty" text, "Browse restaurants" button.

9. **Checkout** — White surface. Title: "Checkout." Order summary card (collapsed: restaurant name, item count, total; expandable). Delivery address card (address with edit icon). Payment method card: Stripe payment element (card input or saved card display). Estimated delivery time. Primary CTA: "Place Order — $XX.XX" (brand-green). Loading state: button shows spinner, screen dims slightly.

10. **Order Confirmation** — Success state. Brand-green top section with animated checkmark (Lottie or Reanimated — circle draws, then check draws). "Order Confirmed!" heading (white). Order number below. White content area: estimated delivery time (prominent, 24pt), order summary (restaurant, items, total). Primary CTA: "Track Your Order" (brand-green outline). Secondary: "Back to Home" (text link).

11. **Order Tracking** —
    - **Status stepper** (top): Vertical step indicator — Order Placed ✓ → Restaurant Accepted ✓ → Preparing → Ready for Pickup → Rider Picked Up → On the Way → Delivered. Active step has brand-green dot + bold text; completed steps have green checkmarks; future steps are muted.
    - **Live map** (middle, ~50% screen height): Google Maps showing rider location (brand-green dot with pulse), restaurant pin, customer address pin, and route polyline. Updates via Socket.IO every 5–10 seconds.
    - **Info card** (bottom, draggable sheet): Rider info (avatar, name, rating), ETA, and vehicle. "Call Rider" and "Message" action buttons. Order details expandable below.

12. **Orders (tab)** — Two segment tabs: "Active" and "Past." Active orders: card with restaurant name, status badge (color-coded), item count, placed time, "Track" button. Past orders: card with restaurant image, name, date, total, star rating (if reviewed), "Reorder" button, "Rate" button (if unreviewed). Empty state for each tab.

13. **Profile (tab)** — User avatar (with edit camera overlay), name, email. Settings list: "My Addresses" → address management screen, "Favorites" → favorite restaurants list, "Payment Methods" → Stripe saved cards, "Notifications" → push preference toggles, "Help & Support", "About Chowly", "Log Out" (red text). Version number at bottom.

14. **Search** — Full-screen search. Auto-focus input with cancel button. Recent searches (chips, clearable). Live results: restaurants and dishes in mixed list. Empty results: "No results for [query]" with suggestion text.

15. **Review** — Post-delivery prompt. Restaurant rating (5-star tap selector, large stars). Rider rating (5-star selector). Optional comment text area. "Submit Review" CTA. "Skip" text link.

### Flow 3 — Rider (authenticated, role: rider)

16. **Rider Home** — Green header with rider greeting and prominent online/offline toggle (large pill switch: red "Offline" ↔ green "Online" with slide animation). When offline: centered illustration, "Go online to start receiving orders." When online: broadcast order cards stack vertically. Each card: restaurant name + distance from rider, customer area, item count, estimated earnings, "Accept" CTA (brand-green). Cards auto-dismiss when accepted by another rider (slide-out animation).

17. **Active Delivery** — Full-screen map with route. Bottom action sheet with step flow:
    - Step 1: "Navigate to [Restaurant]" — directions button (opens Google Maps), "I've Arrived" CTA.
    - Step 2: "Pick up order #XXXX" — order items checklist, "Confirm Pickup" CTA.
    - Step 3: "Deliver to [Customer Name]" — address + directions, "Confirm Delivery" CTA.
    Each step confirmed → sheet updates to next step with slide transition.

18. **Rider Earnings (tab)** — Today's earnings card (prominent number, brand-green), weekly bar chart. Delivery history list: date, restaurant → customer, amount earned. Period selector: Today / This Week / This Month.

19. **Rider Profile (tab)** — Avatar, name, rating (stars + count), vehicle info. Settings: availability schedule, vehicle details, help, log out.

### Flow 4 — Shared

20. **Notifications** — List of push notification history. Each row: icon (order, promo, system), title, message, timestamp. Unread dot indicator. Tap navigates to relevant screen (order tracking, promo, etc.).

---

## Components and states

### Shared controls
- **Green Header:** Reusable component — `GreenHeader` with curved bottom. Props: children (address row, search bar, custom content). Adapts height to content.
- **Bottom Sheet:** Drag-handle, spring animation, backdrop blur/dim, multiple snap points.
- **Restaurant Card:** Two variants — large (featured carousel) and compact (list). Both show: image, name, cuisine, rating, delivery time, fee.
- **Menu Item Card:** Horizontal row with image, name, description, price. Tap target full card.
- **Cart Bar:** Floating bottom bar — item count badge + total + "View Cart" text. Spring entrance.
- **Status Stepper:** Vertical timeline with checkmarks, dots, and connecting lines.
- **Tab Bar:** 3 tabs (Home, Orders, Profile) for customer; 3 tabs (Home, Earnings, Profile) for rider. Brand-green filled icon for active, outline for inactive. Labels below icons.

### States
- **Loading:** Skeleton placeholders matching card/list shapes. Shimmer animation (left→right gradient sweep). Green spinner for pull-to-refresh.
- **Empty:** Centered illustration + heading + body text + action button. Unique per context (empty cart, no orders, no results, offline rider).
- **Error:** Red error banner at top (auto-dismiss 5s) or inline field errors. Network error: full-screen retry with illustration.
- **Disabled:** Reduced opacity (0.5) + no touch response on buttons. Muted text on unavailable menu items.
- **Selected:** Category chips invert to brand-green fill. Radio/checkbox options show brand-green check. Address cards show brand-green left border.
- **Success:** Green checkmark animation. Toast notification from top for quick confirmations.

---

## Assets

### Required illustrations/images

| Asset | Description | Ratio | File |
|---|---|---|---|
| `welcome-hero` | Delivery bag with fresh food, warm ambient light, appetizing colors | 3:4 | `assets/images/welcome-hero.png` |
| `empty-cart` | Simple line illustration of an empty shopping bag | 1:1 | `assets/images/empty-cart.png` |
| `empty-orders` | Line illustration of a receipt/clipboard with nothing on it | 1:1 | `assets/images/empty-orders.png` |
| `no-results` | Line illustration of a magnifying glass with question mark | 1:1 | `assets/images/no-results.png` |
| `rider-offline` | Line illustration of a scooter parked | 1:1 | `assets/images/rider-offline.png` |
| `order-confirmed` | Lottie/Reanimated animated checkmark in brand-green circle | 1:1 | `assets/animations/order-confirmed.json` |
| Category icons | 7 category outline icons (burger, pizza, sushi, salad, coffee, dessert, fast-food) | 1:1 | `assets/icons/category-*.png` |

---

## Representative data

| Data | Shown as | Real source |
|---|---|---|
| Restaurants | "Burger Palace", "Sakura Sushi", "Green Bowl", "Pizza Roma", "The Coffee House" | MongoDB restaurants collection |
| Menu items | "Classic Cheeseburger $8.99", "Margherita Pizza $12.50", "Salmon Roll (8pc) $14.00" | Menu items collection |
| Ratings | "4.7 (342 reviews)", "4.2 (128 reviews)" | Calculated from reviews collection |
| Delivery time | "25–35 min" | Google Directions API distance/time estimate |
| Delivery fee | "$2.49", "Free delivery" | Delivery rules + distance calculation |
| Rider earnings | "$47.50 today", "$312.00 this week" | Rider earnings aggregation |
| Promo code | "WELCOME20 — 20% off your first order" | Promo codes collection |
| Order total | "$24.47" | Server-side calculation |
| User name | "Alex" | User profile |
| Addresses | "123 Main Street, Apt 4B" labeled "Home" | Address collection |

---

## Board prompt and review

```text
Create a high-resolution mobile UI concept board for Chowly, a Deliveroo-style food delivery app.

PRODUCT AND SCOPE
Food delivery marketplace for customers and riders, built with Expo. 5 concept screens showing the core customer journey from browsing to tracking. iOS device frames.

VISUAL DIRECTION
Confident, appetizing, food-forward. Signature split layout: solid teal-green header (#00B37A) on the top 20-25% of each screen with a smooth concave curve transitioning into a clean white (#FFFFFF) content surface below. Inter font family throughout. 16px card radius, 20px pill chips, 12px button radius. Subtle card shadows (0 2px 8px rgba(0,0,0,0.06)). Outline icons, 24px, 1.5px stroke. High-quality food photography dominates — no illustrations for food items. Accent warm orange (#FF6B35) for promotions, golden yellow (#FFB800) for star ratings. Clean, spacious layout with 4px base grid. Dark teal (#00875A) for pressed/active states.

SCREENS
1. Welcome — Full brand-green background. Chowly logo top center (white wordmark). Centered hero image: appetizing delivery bag with fresh colorful food visible, warm lighting. Below image: "Fresh food, delivered fast." headline in white 28pt bold, "Order from the best restaurants near you." subtext in white 14pt. Two pill buttons at bottom: "Continue with Email" (white fill, green text, full-width) and "Continue with Google" (white outline, white text). Bottom link: "Already have an account? Log in" in white.

2. Home — Green header top section: "Hey, Alex 👋" greeting in white, below it a delivery address row "Delivering to Home" with pin icon and chevron, below that a white rounded search bar placeholder "Search restaurants or dishes." Concave curve transitions to white. White content: horizontal scrolling category chips (All, Fast Food, Pizza, Sushi, Healthy, Coffee, Desserts — each with small icon, "All" chip selected in green). "Featured" section with horizontal carousel showing 2 visible large restaurant cards (Burger Palace: burger photo, "4.7 ★ (342)", "25-35 min", "$2.49 delivery"; Sakura Sushi: sushi photo, "4.8 ★ (215)", "30-40 min", "Free delivery"). "Nearby Restaurants" heading with vertical list cards. Bottom tab bar: Home (active, filled green), Orders (outline), Profile (outline).

3. Restaurant Detail — Full-width cover photo of restaurant (burger restaurant, vibrant food photography) with gradient overlay. Back arrow and heart icon top. Overlay: "Burger Palace" name, "American, Burgers" tags, "4.7 ★ (342)", "25-35 min", "$2.49 delivery." Sticky category tabs below: Burgers, Sides, Drinks, Desserts. Menu items as horizontal rows: "Classic Cheeseburger" with description and "$8.99" in green, small square food image right. "BBQ Bacon Burger $11.49." Floating green cart bar at bottom: "2 items — View Cart $20.48."

4. Cart — White background. "Your cart" title. "Burger Palace" subheader. Cart items: "Classic Cheeseburger × 1 — $8.99" with quantity controls, "BBQ Bacon Burger × 1 — $11.49" with quantity controls. Subtotal $20.48, Delivery fee $2.49 (2.3 km), Promo code input row, Total $22.97 bold. Green delivery address summary. Full-width green CTA button: "Go to Checkout — $22.97."

5. Order Tracking — Status stepper at top: "Order Placed ✓" and "Restaurant Accepted ✓" in green, "Preparing" active with green dot and bold text, "Picked Up" and "Delivered" muted and future. Live Google Map in center showing route with green rider dot, restaurant pin, customer pin. Bottom card: rider circular avatar, "Mohammed A." name, "4.9 ★" rating, "Arriving in 12 min" prominent, "Call" and "Message" action buttons.

BOARD COMPOSITION
5 screens in a single row, each in a slim iPhone frame with minimal bezel. Screens arranged left to right in journey order. Light gray (#F0F0F0) board background. Small screen labels below each frame. 16:9 overall board ratio.

QUALITY AND AVOID
Pixel-perfect, production-ready fidelity. Consistent green header curve across Home and applicable screens. Realistic food photography, not cartoons or 3D renders. Legible text at all sizes. No "Lorem ipsum", "placeholder", "sample", or "mock" text anywhere. No Deliveroo logos or branding — this is Chowly. Consistent Inter typography throughout. Ensure the green-to-white curve transition is smooth and visually prominent.
```

**Prompt status:** Ready.

---

## Open decisions

1. **Dark mode priority:** Design tokens defined for dark mode — implement in v1 or defer?
2. **Welcome hero asset:** Generate a food delivery hero image, or use a stock photo?
3. **Category icons:** Generate custom outline icons, or use an existing icon library (e.g., Lucide, Phosphor)?
4. **Lottie animations:** Use Lottie for order confirmation checkmark, or build with Reanimated?
5. **Rider app visual distinction:** Should rider screens have any visual differentiation (e.g., different header shade, badge) to make the role switch obvious, or keep the same green?
