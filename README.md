# Power Kitchen — Subscription Portal v2

## Stack
- **Frontend**: Next.js 16 + Tailwind CSS (App Router)
- **Backend**: Nest.js BFF
- **Design**: Tailwind UI Blocks patterns

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend (BFF)
```bash
cd backend
npm install
npm run build && npm start
# → http://localhost:4000/api
```

## Structure

```
portal/
  frontend/          Next.js app
    app/
      (portal)/
        dashboard/   5.1 Dashboard
        orders/      5.2 Upcoming Orders
        orders/[id]/ 5.3 Order Detail + Draft Mode
        plan/        5.6 Subscription Settings
        plan/dietary/ 5.7 Dietary Restrictions
        plan/address/ 5.8 Address Management
        plan/payment/ 5.9 Payment Management
        rewards/     5.12+5.13 Rewards + Referral
        billing/     5.10 Billing History
        credits/     5.11 Store Credits & Gift Cards
        help/        5.16 Help & Support
    components/
      layout/        Sidebar, Header, MobileNav
      ui/            Badge, Button, Card, DietaryPills
      meals/         AddSwapPanel (5.4 Add/Swap)
    lib/
      mock-data.ts   Development mock data
      utils.ts       Formatters

  backend/           Nest.js BFF
    src/modules/
      auth/          JWT session management
      subscription/  Plan management + pause/cancel retention flow
      orders/        Batch changes processor (Draft Mode core)
      meals/         Meal catalog (cached 1hr)
      dietary/       Dietary restrictions management
      credits/       Store credits + gift card workaround
      gamification/  Streaks, tiers, challenges engine
      feedback/      Meal ratings system
      customer/      Address + payment management
      billing/       Billing history + receipts
      referral/      Referral program
```

## Key Features Built
- ✅ Draft Mode (batch save — eliminates 7s/action problem)
- ✅ Add/Swap Item slide-over panel with filters
- ✅ Skip/Unskip with confirmation modal
- ✅ Dietary restrictions toggles
- ✅ Gamification: streak, tiers, challenges
- ✅ Referral program
- ✅ Store credits + gift card input
- ✅ FAQ accordion
- ✅ Mobile bottom navigation
- ✅ Sidebar with streak/credit snapshot
- ✅ All 10 portal pages

## Next Steps (to connect to Appstle + Shopify)
1. Replace mock data in `lib/mock-data.ts` with real API calls
2. Wire frontend `fetch` calls to BFF endpoints
3. Implement JWT auth guard in backend
4. Configure Shopify customer token verification in `auth.service.ts`
5. Implement Appstle API calls in `orders.service.ts`
