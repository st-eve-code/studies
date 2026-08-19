# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Powersports owners and riders (ATV/UTV, dirt bike, watercraft, snowmobile, street bike) in the US looking for OEM and aftermarket parts, priced in USD. The primary job: find the right part for their machine and add it to a cart fast.

## Product Purpose

An e-commerce storefront for a powersports dealership. The storefront exists to sell parts. Success means a visitor lands, recognizes the shop as an authorized dealer, picks a brand or category, finds parts, and completes a cart flow without friction.

## Positioning

Authorized-dealer parts storefront: real OEM-grade inventory (brands like Can-Am, Polaris, Yamaha, Honda, Kawasaki, KTM, Sea-Doo, Ski-Doo, Suzuki, CFMOTO, Arctic Cat) backed by dealer service, shipped with a no-haggle pricing promise.

## Operating Context

- Parts are served from Route Handlers (`/api/parts`, `/api/parts/[sku]`, `/api/search`) that read `data/catalog-parts.json` (1153 real scraped parts, all with images, USD pricing, fitment data).
- Fitment-driven: parts carry YMM (year/make/model) fitment; a year-make-model picker exists for matching parts to a vehicle.
- Cart, wishlist and checkout flows are already implemented and must keep working.
- Company pages (about, contact, privacy, terms, promotions), cart, checkout and wishlist stay in the site.

## Capabilities and Constraints

- Parts-only focus: vehicle inventory, microfiche and service/trade-in pages are removed from navigation (per user decision) while parts, brands, cart, checkout and wishlist remain.
- Existing data (`data/catalog-parts.json`) and the parts API stay the source of truth for parts; brands come from `data/brands.ts` (Can-Am, Polaris, Yamaha, Honda, Kawasaki, Sea-Doo, Ski-Doo, KTM, Suzuki, CFMOTO, Arctic Cat).
- Theme system is Tailwind v4 with dark-mode support; `lucide-react` for icons; Next.js App Router with `"use client"` pages using `fetchParts` from `lib/mock-api.ts`.
- Prices and product facts come from scraped dealer data; do not invent prices, reviews, or stock.

## Brand Commitments

- Dealership identity "Xtreme Powersports Inc." with contact/config from `lib/site-config.ts` (env-driven). Do not change the company identity, address, or contact facts.
- Brand accent is orange (current ring/orange-600 usage) and the dark hero direction the user chose ("dark racing + light shop" with KTM, Amazon and eauto.co.in as design references).

## Evidence on Hand

- `data/catalog-parts.json` — 1153 parts with images and fitment.
- `data/brands.ts` — brand marks (logo PNGs) and taglines.
- `components/logo/slides/*.jpg` — existing hero imagery for the dealership.
- `lib/site-config.ts` — dealer contact, hours, social, address.
- No manufactured testimonials, prices, or reviews: customer-review content already on the site is incumbent content; do not fabricate new claims.

## Product Principles

- Parts are the product: every page leads to finding and buying a part.
- Real inventory beats decoration: show scraped parts, real fitment, honest stock states.
- A dealer storefront must feel fast, trustworthy and precise.
- Dark racing atmosphere for brand identity; clean light surfaces where visitors compare and buy.
- Keep working flows intact: cart, wishlist, checkout, search.

## Accessibility & Inclusion

- Keep existing keyboard/aria affordances in nav, search modal, and cart flows.
- Maintain contrast on dark hero and light shop surfaces; respect `prefers-reduced-motion`.
