# Chowly — Board Prompts (All 20 Screens)

Grouped into 4 boards by flow. Each prompt is copy-ready — paste directly into an image generator.

---

## Board 1 — Auth Flow (5 screens)

```text
Create a high-resolution mobile UI board for Chowly, a food delivery app. 5 screens showing the authentication flow. iOS device frames.

VISUAL DIRECTION
Confident, appetizing, food-forward. Solid teal-green (#00B37A) as brand color. Inter font family throughout. 16px card radius, 20px pill chips, 12px button radius. Subtle card shadows (0 2px 8px rgba(0,0,0,0.06)). Outline icons, 24px, 1.5px stroke. Clean, spacious layout with 4px base grid. Dark teal (#00875A) for pressed states. White (#FFFFFF) content surfaces. Muted text in #6B7280. Error red #E53E3E for validation. Primary buttons are brand-green with white text. Secondary buttons are outlined.

SCREENS
1. Splash — Solid brand-green (#00B37A) full-screen background. "Chowly" white wordmark logo centered vertically. Clean, minimal, no other elements. Status bar white text.

2. Welcome — Full brand-green background throughout. Chowly white wordmark logo at top center. Large centered hero image: a brown paper delivery bag overflowing with fresh colorful food (burgers, salad, bread), warm ambient lighting, appetizing colors, photorealistic. Below hero: "Fresh food, delivered fast." headline in white 28pt bold. "Order from the best restaurants near you." in white 14pt regular below. Two full-width pill buttons near bottom: "Continue with Email" (white fill, green text, 48pt height) and "Continue with Google" (white 1px outline, white text, 48pt height). Bottom center text link: "Already have an account? Log in" in white 14pt.

3. Sign Up — White background. Back arrow icon top-left (black). Title: "Create your account" in black 28pt bold, left-aligned. Four input fields stacked vertically with 16px gap: "Full name" (outline input, 12px radius, placeholder gray), "Email address", "Phone number", "Password" (with eye toggle icon right). Each input 48pt height. Full-width brand-green pill button at bottom: "Continue" in white 16pt semibold. Below button: "Already have an account? Log in" as gray text link with "Log in" in brand-green.

4. Log In — White background. Back arrow top-left. Title: "Welcome back" in black 28pt bold. Two input fields: "Email address" and "Password" (with eye toggle). "Forgot password?" link in brand-green below password field, right-aligned. Full-width brand-green pill button: "Log In" in white. Below: "Don't have an account? Sign Up" with "Sign Up" in brand-green.

5. Add Address — White background. Back arrow top-left. Title: "Where should we deliver?" in black 28pt bold. Search input with magnifying glass icon: "Search for your address" placeholder, 48pt height, light gray background (#F7F7F7), 12px radius. Below: Google Maps preview showing a map with a green pin marker, 200px height, 16px radius. Address confirmation card below map: "123 Main Street, Apt 4B, New York, NY 10001" in black 14pt, edit pencil icon right. Three pill chips in a row: "Home" (selected, brand-green fill, white text), "Work" (gray outline), "Other" (gray outline). Full-width brand-green pill button at bottom: "Confirm Address." Below: "Skip for now" gray text link.

BOARD COMPOSITION
5 screens in a single row, each in a slim iPhone 15 Pro frame with minimal bezel. Left to right in flow order. Light gray (#F0F0F0) board background. Small screen name labels centered below each frame in dark gray 12pt. 16:9 overall board ratio.

QUALITY AND AVOID
Pixel-perfect, production-ready fidelity. Realistic food photography on Welcome hero, not cartoons or 3D renders. Legible text at all sizes. No "Lorem ipsum", "placeholder", "sample", or "mock" text. No Deliveroo or other real brand logos. Consistent Inter typography. Green inputs and controls must look native iOS quality.
```

---

## Board 2 — Customer Browsing (5 screens)

```text
Create a high-resolution mobile UI board for Chowly, a food delivery app. 5 screens showing the customer browsing experience. iOS device frames.

VISUAL DIRECTION
Confident, appetizing, food-forward. Signature layout: solid teal-green (#00B37A) header on top 20-25% of screen with a smooth concave curve transitioning into clean white (#FFFFFF) content below. Inter font family throughout. 16px card radius, 20px pill chips, 12px button radius. Subtle card shadows (0 2px 8px rgba(0,0,0,0.06)). Outline icons, 24px, 1.5px stroke. High-quality food photography dominates. Accent warm orange (#FF6B35) for promotions. Golden yellow (#FFB800) for star ratings. Muted text #6B7280. 4px base spacing grid. Dark teal (#00875A) for pressed states.

SCREENS
1. Home — Brand-green (#00B37A) header fills the top 25% of the screen. White status bar text. "Hey, Alex 👋" in white 16pt semibold top-left with padding. Below: pin icon + "Delivering to Home" in white 14pt + small white chevron-down icon. Below: white rounded search bar pill (full width within padding), 44pt height, magnifying glass icon left, "Search restaurants or dishes" placeholder in light gray. The green header ends with a smooth concave curve sweeping down into white. White content area below: horizontal scrolling category chips row — "All" (brand-green fill, white text, selected), "Fast Food" (gray bg #F7F7F7, dark text), "Pizza", "Sushi", "Healthy", "Coffee", "Desserts" — each chip has a small colored food icon above the label. "Featured" section heading in black 20pt semibold. Horizontal carousel of 2 visible large restaurant cards: Card 1: top half is a vibrant burger photograph (16:9), bottom half white with "Burger Palace" in 16pt semibold, "4.7 ★ (342)" with golden star, "25-35 min · $2.49 delivery" in gray 12pt. Card 2: sushi photo, "Sakura Sushi", "4.8 ★ (215)", "30-40 min · Free delivery" in green text. Below: "Nearby Restaurants" heading. Vertical list cards showing restaurant row items. Bottom tab bar: Home icon (filled green, "Home" green label), Orders icon (outline gray), Profile icon (outline gray).

2. Address Bottom Sheet — Same Home screen visible behind a semi-transparent dark overlay. A white bottom sheet slides up from bottom with 24px top corner radius and a small gray drag handle centered at top. Title: "Delivery address" in 20pt semibold. List of 2 saved addresses: each row has a green radio button left, address label ("Home" in 16pt semibold, "123 Main Street, Apt 4B" in gray 14pt below), and a small green "Default" badge on the first one. Second address: "Work", "456 Business Ave, Floor 3". Divider line. Last row: green "+" circle icon + "Add new address" in brand-green 14pt.

3. Search — White background. Top: search input bar with auto-focus cursor, "burger" typed in black, "Cancel" text link in brand-green right. Below input: "Recent searches" label in gray 12pt. Row of pill chips: "Pizza", "Sushi", "Coffee" with small x icons. Divider. Search results section: "Restaurants" subheading. Restaurant result cards: "Burger Palace" with small square burger image, "4.7 ★", "25-35 min". "BBQ Brothers" with rib image, "4.5 ★", "20-30 min". "Dishes" subheading below. Dish result rows: "Classic Cheeseburger" with tiny food image, "Burger Palace · $8.99". "Wagyu Burger" with image, "BBQ Brothers · $15.99".

4. Restaurant Detail — Full-width cover photograph of a burger restaurant interior with burgers on a grill, vibrant warm food photography, 240px height, with a dark gradient overlay at bottom. White back arrow button (circle, top-left) and white heart outline icon (circle, top-right) overlaid on image. Restaurant info overlaid on gradient: "Burger Palace" in white 24pt bold, "American, Burgers" in white 14pt tags below, "4.7 ★ (342)" with golden star + "25-35 min" + "$2.49 delivery" in white 12pt row. Below the image: sticky horizontal category tab bar with brand-green underline on active tab: "Burgers" (active, green text, green underline), "Sides" (gray), "Drinks" (gray), "Desserts" (gray). Menu items below: Item row 1: "Classic Cheeseburger" in 16pt semibold, "Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce" in gray 14pt 2-line description, "$8.99" in brand-green 16pt semibold left side. 64x64px square cheeseburger photo, 12px radius, right side. Item row 2: "BBQ Bacon Burger", "Smoky BBQ sauce, crispy bacon, onion rings, and aged cheddar", "$11.49" green. Burger photo right. Floating brand-green cart bar at bottom: "2 items — View Cart    $20.48" in white text, 48pt height, 12px radius, subtle shadow.

5. Item Detail Bottom Sheet — Semi-transparent overlay behind. White bottom sheet from bottom, 24px top radius, drag handle. Large food photo at top inside sheet: a close-up juicy cheeseburger, full width, 200px height, rounded top corners. "Classic Cheeseburger" in 20pt semibold below. "Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce" in gray 14pt. "$8.99" in brand-green 16pt. Divider. "Size" label in 16pt semibold with red "Required" badge. Three radio options: "Regular" (selected, green radio filled) "$0.00", "Large" "$2.00", "Extra Large" "$3.50". Divider. "Extra Toppings" label with gray "Optional" text. Checkbox options: "Extra Cheese + $1.50" (unchecked), "Bacon + $2.00" (checked, green checkbox), "Jalapeños + $0.75" (unchecked). Bottom row: quantity selector "−  1  +" in a rounded control, and full-width brand-green button: "Add to Cart — $12.99" in white.

BOARD COMPOSITION
5 screens in a single row, each in a slim iPhone 15 Pro frame with minimal bezel. Left to right in flow order. Light gray (#F0F0F0) board background. Small screen name labels centered below each frame. 16:9 overall board ratio.

QUALITY AND AVOID
Pixel-perfect, production-ready fidelity. The green-to-white concave curve on the Home screen must be smooth and prominent. Realistic food photography throughout, not cartoons or 3D renders. Legible text at all sizes. No "Lorem ipsum", "placeholder", "sample", or "mock" text. No Deliveroo or real brand logos. Consistent Inter typography. Bottom sheets must show realistic overlay dimming behind them.
```

---

## Board 3 — Order Flow (5 screens)

```text
Create a high-resolution mobile UI board for Chowly, a food delivery app. 5 screens showing the order and tracking flow. iOS device frames.

VISUAL DIRECTION
Confident, appetizing, food-forward. Solid teal-green (#00B37A) as brand color. Inter font family. 16px card radius, 20px pill chips, 12px button radius. Subtle card shadows (0 2px 8px rgba(0,0,0,0.06)). Outline icons, 24px, 1.5px stroke. Clean white (#FFFFFF) surfaces. Muted text #6B7280. Golden yellow #FFB800 for stars. Warm orange #FF6B35 for discount/promo accents. 4px spacing grid. Dark teal #00875A for pressed states.

SCREENS
1. Cart — White background. Back arrow top-left. "Your cart" title in 24pt bold. "Burger Palace" sub-header in 16pt semibold with small restaurant icon. Divider. Cart item 1: 48px square cheeseburger photo (12px radius) left, "Classic Cheeseburger" 16pt semibold, "Regular, Extra Bacon" in gray 12pt below (selected options), right side: "$8.99" in brand-green, below that a rounded quantity control: "−  1  +" with border. Cart item 2: burger photo, "BBQ Bacon Burger", "Large", "$13.49" green, "−  1  +" quantity. Divider. Price breakdown rows (label left, amount right): "Subtotal" — "$22.48", "Delivery fee" — "$2.49 (2.3 km)" in gray, "Promo code" row — text input with "Enter code" placeholder + "Apply" brand-green text button. Thick divider. "Total" in 18pt bold — "$24.97" in 18pt bold. Delivery address summary card: green pin icon, "Delivering to Home" semibold, "123 Main Street, Apt 4B" gray, chevron-right icon. Full-width brand-green pill button bottom: "Go to Checkout — $24.97" white text.

2. Checkout — White background. Back arrow. "Checkout" title 24pt bold. Order summary card (collapsed): restaurant icon + "Burger Palace" + "2 items" + "$24.97" with chevron to expand. Delivery address card: green pin icon, "Home" label bold, "123 Main Street, Apt 4B" gray, "Change" link in brand-green right. Payment method card: credit card icon, "Payment method" heading, Stripe card input element showing a card field with "4242 •••• •••• 4242" and "12/28" and "CVC", clean bordered input style. Estimated delivery: clock icon, "Estimated delivery: 25-35 min" in 14pt. Full-width brand-green pill button: "Place Order — $24.97" white text. Small gray text below: "By placing your order you agree to our Terms of Service."

3. Order Confirmation — Top section: brand-green (#00B37A) fills the top 40% of screen. Large white animated checkmark inside a white circle outline (drawn state) centered in green area. "Order Confirmed!" in white 28pt bold below checkmark. "Order #CH-4829" in white 14pt below. The green area curves into white below. White content: "Estimated delivery" label in gray 12pt, "25-35 min" in black 32pt bold prominent. Divider. Order summary: "Burger Palace" with icon, "Classic Cheeseburger × 1", "BBQ Bacon Burger × 1", "Total: $24.97" bold. Two buttons at bottom: "Track Your Order" brand-green outline pill button (green border, green text). "Back to Home" gray text link below.

4. Order Tracking — White background. Back arrow top-left. "Order Tracking" title in 18pt semibold. Status stepper at top (vertical, left-aligned with connecting lines): Step 1: green filled circle + green checkmark, "Order Placed" green text, "6:45 PM" gray timestamp. Green vertical line. Step 2: green filled circle + checkmark, "Restaurant Accepted" green text, "6:47 PM". Green line. Step 3: brand-green dot (larger, pulsing ring implied), "Preparing" in black bold 16pt (active step), no timestamp yet. Gray dashed line. Step 4: gray empty circle, "Picked Up" in gray muted text. Gray dashed line. Step 5: gray circle, "Delivered" gray text. Below stepper: Google Maps view, 50% screen height, 16px radius, showing a street map with: green dot (rider location) on a road, red pin (restaurant) nearby, blue pin (customer address) further away, green dashed polyline route connecting them. "Google" watermark corner. Below map: white card with shadow, rider info: circular avatar photo of a male rider, "Mohammed A." 16pt semibold, "4.9 ★" with golden star, right side. "Arriving in 12 min" in 20pt bold brand-green prominent text center. Two outline buttons row: phone icon + "Call" and message icon + "Message" side by side.

5. Review — White background. Back arrow. "Rate your experience" title 24pt bold. Restaurant section: "Burger Palace" with small logo. "How was the food?" in 16pt. Five large star outlines in a row — 4 filled golden (#FFB800) + 1 outline gray (4-star rating shown). Divider. Rider section: circular rider avatar, "Mohammed A." name. "How was the delivery?" in 16pt. Five stars — 5 filled golden (5-star rating). Divider. "Leave a comment (optional)" label. Multi-line text input with placeholder "Tell us more about your experience..." in gray, 100px height, light gray background, 12px radius. Full-width brand-green pill button: "Submit Review". "Skip" gray text link below.

BOARD COMPOSITION
5 screens in a single row, each in a slim iPhone 15 Pro frame. Left to right in flow order. Light gray (#F0F0F0) background. Screen labels below. 16:9 ratio.

QUALITY AND AVOID
Pixel-perfect fidelity. Realistic map on tracking screen with clear route. Green curve on confirmation screen must be smooth. Star ratings must be clearly golden filled vs gray outline. No "Lorem ipsum", "placeholder", "sample", "mock". No real brand logos. Consistent Inter font. Legible at all sizes.
```

---

## Board 4 — Tabs + Rider (5 screens)

```text
Create a high-resolution mobile UI board for Chowly, a food delivery app. 5 screens showing customer tabs and the rider experience. iOS device frames.

VISUAL DIRECTION
Confident, food-forward. Solid teal-green (#00B37A) brand color. Inter font family. 16px card radius, 20px pill chips, 12px button radius. Subtle card shadows. Outline icons 24px. Clean white (#FFFFFF) surfaces. Muted text #6B7280. Golden #FFB800 stars. Brand-green for active/success states. 4px spacing grid. For rider screens, the same green header is used but with a prominent online/offline toggle. Red (#E53E3E) for offline state.

SCREENS
1. Orders (Customer Tab) — White background. "Orders" title 24pt bold top-left. Two segment tabs below title: "Active" (selected, brand-green underline, green text) and "Past" (gray text). Active orders section: Order card 1: left side — "Burger Palace" 16pt semibold, "2 items" gray 12pt, "Placed 12 min ago" gray 12pt. Right side — green status badge pill "Preparing" (green bg, white text, small). "Track" button (brand-green outline, small pill). Order card 2: "Sakura Sushi", "1 item", "Placed 25 min ago", orange badge "On the Way". "Track" button. Bottom tab bar: Home (outline gray), Orders (filled green, "Orders" green label), Profile (outline gray).

2. Profile (Customer Tab) — White background. Top center: large circular user avatar photo (80px, with small green camera icon overlay bottom-right for edit). "Alex Johnson" in 20pt semibold below avatar. "alex@email.com" in gray 14pt. Divider with spacing. Settings menu list with clean rows, each row: left icon (outline, gray) + label (16pt regular) + right chevron. Rows: pin icon "My Addresses", heart icon "Favorites", credit-card icon "Payment Methods", bell icon "Notifications", help-circle icon "Help & Support", info icon "About Chowly". Divider. Last row: logout icon in red + "Log Out" in red (#E53E3E) text, no chevron. Very bottom center: "Version 1.0.0" in gray 12pt. Bottom tab bar with Profile active (filled green).

3. Rider Home (Online) — Brand-green header top 20%. White status bar text. "Hey, Mohammed 👋" in white 16pt semibold. Below greeting: large prominent toggle switch — a wide pill (160px wide, 48px tall) with "Online" label in white, green fill (#00B37A), white circle toggled to the right side, subtle green glow. The green header has the concave curve into white. White content: "Available Orders" heading 20pt semibold. Broadcast order cards stacked vertically: Card 1: white card with shadow, left section — "Burger Palace" restaurant name 16pt semibold, "📍 0.8 km from you" in gray 12pt, "3 items" gray, right section — "$4.50" estimated earnings in brand-green 20pt bold. Full-width green "Accept" pill button inside card. Card 2: "Pizza Roma", "📍 1.2 km", "2 items", "$3.75" earnings, "Accept" button. Card 3 partially visible below. Bottom tab bar: Home (filled green), Earnings (outline), Profile (outline).

4. Active Delivery (Rider) — Full-screen Google Map taking up top 60% showing a street map with: green dot (rider position) on a road, red restaurant pin labeled "Burger Palace", blue customer pin labeled "Alex J.", green polyline route from rider to restaurant. Back arrow overlay top-left (white circle). Below map: white bottom sheet/card with 24px top radius, shadow. Current step: Step indicator dots at top — dot 1 (green filled, active), dot 2 (gray), dot 3 (gray). "Navigate to Restaurant" in 18pt bold. "Burger Palace" with address "789 Food Street" in gray 14pt. Blue "Open in Maps" outline button with navigation icon. Divider. Order summary collapsed: "Order #CH-4829 · 3 items" with expand chevron. Full-width brand-green pill button: "I've Arrived" in white text.

5. Rider Earnings — White background. "Earnings" title 24pt bold. Top card: brand-green background card, 16px radius. "Today's Earnings" in white 12pt label. "$47.50" in white 36pt bold. "8 deliveries" in white 14pt below. Below card: period selector pills: "Today" (selected, green fill white text), "This Week" (gray outline), "This Month" (gray outline). Simple bar chart: 7 bars for each day of the week (Mon-Sun), green filled bars of varying heights representing daily earnings, axis labels. "Delivery History" heading below chart. History list rows: each row — date + time left ("Today, 6:52 PM"), route "Burger Palace → Alex J." center, amount "+$4.50" brand-green right. Second row: "Today, 5:30 PM", "Pizza Roma → Sarah K.", "+$3.75". Third row visible. Bottom tab bar: Home (outline), Earnings (filled green), Profile (outline).

BOARD COMPOSITION
5 screens in a single row, each in a slim iPhone 15 Pro frame. Left to right in listed order. Light gray (#F0F0F0) background. Screen labels below. 16:9 ratio.

QUALITY AND AVOID
Pixel-perfect fidelity. The online toggle on Rider Home must look like a real iOS-quality switch with green glow. Map on Active Delivery must show clear route and pins. Bar chart on Earnings must have clean proportional bars. No "Lorem ipsum", "placeholder", "sample", "mock". No real brand logos. Consistent Inter font. All text legible.
```

---

## Quick reference

| Board | Flow | Screens |
|---|---|---|
| **1** | Auth | Splash, Welcome, Sign Up, Log In, Add Address |
| **2** | Browsing | Home, Address Sheet, Search, Restaurant Detail, Item Detail Sheet |
| **3** | Ordering | Cart, Checkout, Confirmation, Tracking, Review |
| **4** | Tabs + Rider | Orders, Profile, Rider Home, Active Delivery, Rider Earnings |

> **Not shown** (simple variations of existing patterns): Notifications (list), Rider Profile (same as Customer Profile with vehicle info). These reuse established components and don't need separate board screens.
