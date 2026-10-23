# Security Specification for LUXEUPHO Furniture & Home Interiors

## 1. Data Invariants
- Catalog data (products, categories, banners, settings) are public read to allow seamless browsing.
- Only authenticated administrators (`rayanali5698@gmail.com` or admins collection record) can create, update, or delete catalog records.
- Orders contain sensitive Personally Identifiable Information (customer name, phone number, physical delivery address). Writes are open to customers for checkout with strict payload constraints. Reads and list queries are strictly restricted to administrators or verified order owners.
- Customer support and consultation enquiries contain customer contact numbers and private notes. Reads and updates are strictly restricted to administrators.

## 2. Dirty Dozen Payload Analysis
1. Unauthenticated Product Injection: Blocked by `isAdmin()` requirement on `products/{id}`.
2. Shadow Admin Escalation: Blocked by restriction on `admins/{uid}` write.
3. Order PII Scraping: Blocked because `allow list` on `orders` requires `isAdmin()`.
4. Enquiry Scraping: Blocked because `allow read` on `enquiries` requires `isAdmin()`.
5. Oversized Text Denial of Wallet: Bounded by `.size() <= MAX` on all incoming strings.
6. Negative Price Poisoning: Blocked by `incoming().total >= 0`.
7. Empty Customer Details: Blocked by mandatory field length validations.
8. Unauthorized Status Alteration: Customer cannot modify order status once created; only admin can update.
9. Malformed ID Path Injection: Validated document pathways.
10. Anonymous Enquiry Modification: Only admin can mark enquiries as In Progress / Resolved.
11. Settings Overwrite: Blocked by `isAdmin()` requirement on `settings/{id}`.
12. Order List Delegation: Rules do not delegate query security to client; rules directly check `isAdmin()`.
