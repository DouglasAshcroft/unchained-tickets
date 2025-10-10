Epic: Venue Onboarding Experience for Unchained

Purpose

To ensure venues and event organizers can migrate to Unchained without losing functionality, this epic organizes the core onboarding features into user‑centric stories. Each story focuses on a discrete capability needed to set up, sell and manage tickets, engage fans, and settle payments. Where available, acceptance criteria reference supporting evidence from existing ticketing platforms or industry sources.

User Stories and Acceptance Criteria
Story 1 – Fast Event Creation

As an event organizer, I want to create and publish an event quickly with all essential details, so that I can start selling tickets in minutes without needing technical expertise.

Acceptance Criteria:

A guided wizard collects event name, date, time, venue location and allows uploading an image; completing the wizard should make the event ready to publish. Ticketor notes that users can sign up, follow a walk‑through and “create your event … and start selling in minutes”
ticketor.com
.

The platform should allow editing event details (name, time, prices, capacity) at any time, even after sales have begun, to correct mistakes
ticketor.com
.

Story 2 – Flexible Ticket Types and Seating

As an event organizer, I want to define multiple ticket types and seating configurations, so that I can handle general admission, reserved seating, VIP and add‑ons in one system.

Acceptance Criteria:

Organizers can create unlimited ticket categories (GA, VIP, Early Bird, multi‑day passes, parking vouchers, meal packages) with independent pricing, quantity and sales windows.

For reserved seating events, a seat‑map designer lets organizers upload or design seating charts and assign price tiers to sections; buyers must be able to choose their seats on an interactive map
ticketor.com
.

Ticket tiers support presales (access codes or NFT‑gated requirements), per‑buyer limits, wait‑lists and group discounts (e.g., buy four tickets, get 10 % off). The tokenproof platform allows presales that require ownership of a specific token before purchasing
docs.tokenproof.xyz
.

Story 3 – Promo Codes and Custom Checkout Questions

As an event organizer, I want to offer promo codes and collect custom information during checkout, so that I can run marketing campaigns and gather attendee data.

Acceptance Criteria:

The system allows unlimited promo or access codes that can apply discounts or unlock hidden ticket categories
bandwango.com
. Organizers can set usage limits and expiry dates for each code.

During checkout, organizers can add custom questions (e.g., meal preference, T‑shirt size) and designate them as required or optional; answers are stored and exportable
docs.tokenproof.xyz
.

Story 4 – Branded Event Pages and Marketing

As an event organizer, I want my ticketing page to reflect my venue’s brand and integrate with marketing tools, so that attendees recognize my brand and can discover my events.

Acceptance Criteria:

Organizers can customize the event page with logos, banners, brand colours and a custom domain or embed widget; the page should support social‑media share buttons and generate social previews.

Built‑in email tools send confirmation, reminder and post‑event emails using editable templates (including sponsor logos). Organizers can schedule or send manual blasts to attendees.

A referral/affiliate system generates tracking links for fans or partners; the system logs sales from each link and can automatically reward referrers with discounts, cash‑back or NFT perks.

Events appear in Unchained’s discovery portal/app (if available), searchable by category and location.

Story 5 – Easy, Transparent Checkout and Delivery

As a ticket buyer, I want a streamlined and transparent purchase experience with flexible payment options, so that I can buy tickets easily on any device.

Acceptance Criteria:

The checkout process is mobile‑responsive, supports multiple languages and displays total cost (including fees) before finalizing the order【23†L21-L24】.

Buyers can pay with major credit/debit cards, PayPal, Venmo, Apple Pay, Google Pay and other local methods; Ticketor’s platform accepts cash, check, credit cards, Zelle, Venmo and Apple Pay at the box office
ticketor.com
, demonstrating support for a broad range of payment options.

Buyers can purchase as guests using email/phone or create an account; social logins (Google/Facebook) are available. The process should not require a crypto wallet; the system can mint NFT tickets to a custodial wallet associated with the buyer’s account.

Immediately after purchase, the buyer receives a digital ticket via email and/or SMS. The confirmation page and email must offer an “Add to Apple Wallet/Google Wallet” link, aligning with industry advice that ticketing platforms should immediately let customers add passes to their mobile wallet
purplepass.com
. Physical or print‑at‑home options are available if needed
ticketor.com
.

Story 6 – Complex Orders and Accessibility

As a ticket buyer, I want to purchase multiple events or add‑ons in one transaction and ensure the checkout is accessible, so that I can bundle purchases and everyone can buy tickets easily.

Acceptance Criteria:

A single shopping cart allows customers to buy tickets for several events, merch items and donations together; Ticketor notes that buyers can buy tickets, merchandise and gift cards in one transaction
ticketor.com
.

Taxes and fees are itemized; group pricing rules (e.g., family or couple packages) and multi‑event bundles (season passes) are supported.

The checkout flow meets WCAG accessibility guidelines (screen‑reader compatibility, keyboard navigation, high‑contrast options) to accommodate all users.

Story 7 – Robust Check‑In and Entry Management

As event staff, I want reliable tools to scan tickets, manage access and handle special cases, so that attendees enter quickly and securely.

Acceptance Criteria:

An organizer scanning app is available on iOS/Android to log in and select the correct event; it can scan barcodes, QR codes or NFT credentials
simpletix.com
.

Scans must validate tickets instantly and prevent duplicates; animated or rotating QR codes (as used by tokenproof) help stop fraudulent screenshot sharing
docs.tokenproof.xyz
.

When multiple devices are scanning simultaneously, the system synchronizes scan data in real time and offers an offline mode: SimpleTix’s mobile check‑in app includes an offline scanning mode for situations without reliable internet
simpletix.com
.

The app supports partial/multi‑entry: staff can allow re‑entry for multi‑day or in‑and‑out passes and verify the correct session/time slot.

Staff can search a guest list by name or email and manually check in VIPs or replace lost tickets. Walk‑up sales at the door should be supported with on‑site payment and ticket printing.

If desired, the app integrates with thermal printers and wristband printers for printed credentials; at a minimum, the system exports a door‑list for offline backup.

Story 8 – Real‑Time Sales and Attendance Reporting

As an event organizer, I want live dashboards and exportable reports, so that I can monitor ticket sales, attendance and finances in real time.

Acceptance Criteria:

A sales dashboard displays tickets sold per category, remaining inventory and revenue; graphs show sales velocity. SimpleTix advertises “real‑time analytics” and “customizable dashboards” providing detailed insights into attendance and sales
simpletix.com
.

A check‑in dashboard shows how many attendees have been scanned in by ticket type and gate, updating live during the event.

Financial reports list each transaction, fees and net payout; all reports can be exported to CSV/Excel for accounting.

Organizers can export attendee data (names, emails, answers to custom questions) for marketing or compliance.

Advanced insights such as peak purchase times, geographic distribution and device usage help organizers optimize future campaigns.

The platform integrates with external analytics (Google Analytics, Facebook Pixel) and offers APIs/webhooks for real‑time data syncing to CRMs or marketing tools.

Story 9 – Fan Engagement and NFT Benefits

As an event organizer, I want to leverage NFTs for collectible tickets, loyalty rewards and fair resale, so that I can build deeper relationships with fans and unlock new revenue.

Acceptance Criteria:

The organizer can choose to mint tickets as NFTs. After scanning, the NFT transforms into a digital collectible stored in the attendee’s wallet; organizers can deliver post‑event content (videos, unreleased tracks or discounts) through the NFT
avax.network
. This feature should be optional but easy to enable.

A loyalty module tracks repeat attendance and automatically grants rewards (e.g., discounts, special NFT badges) after a threshold. The Avax case study notes that blockchain tickets can reward fan loyalty and provide exclusive content and benefits
avax.network
avax.network
.

Smart contracts enforce resale rules: the organizer can set a price ceiling and royalty percentage on secondary sales, ensuring revenue stays within the ecosystem and preventing scalpers from gouging prices
avax.network
.

Token‑gated access allows specific NFT holders to unlock presales or VIP areas; tokenproof’s platform demonstrates that events can require owning a particular NFT before purchasing a ticket
docs.tokenproof.xyz
.

During checkout, buyers can purchase merchandise or add‑on packages in the same transaction; Tixr’s philosophy of bundling ticket upgrades and add‑ons shows the commercial benefit of integrated upsells
ticketor.com
.

The system is designed to hide blockchain complexity: fans can pay in fiat and receive their NFT tickets in a custodial wallet without managing crypto.

Story 10 – Security, Compliance and Support

As an event organizer, I want my ticketing system to be secure, compliant and supported, so that I can trust it during high‑demand on‑sales and protect attendee data.

Acceptance Criteria:

Transactions are encrypted and payment processing is PCI‑compliant. The system meets GDPR/CCPA data privacy regulations and clearly communicates how attendee data is used.

Anti‑bot measures (CAPTCHAs, wait‑lists, verified fan pre‑registration) can be enabled for high‑demand events to prevent bot purchasing and ensure real fans get tickets. The Avax article notes that blockchain can verify fans and prevent scalping
avax.network
.

The platform is cloud‑based with autoscaling and redundancy, offering uptime suitable for large onsales and immediate failover.

Organizers and buyers have access to 24/7 support. Self‑service documentation, step‑by‑step tutorials and live chat/email support should be available.

For major events, Unchained can provide an on‑site support option or a dedicated account manager.

Story 11 – Finance and Settlement

As an event organizer, I want flexible payout and refund options with clear settlement reports, so that I can manage cash flow and handle cancellations easily.

Acceptance Criteria:

Organizers choose when to receive funds – immediately as sales occur or in scheduled batches. Options should include ACH/bank transfers and, if allowed, connecting their own payment processor.

A final settlement report is provided after each event, summarizing tickets sold, total revenue, fees, refunds and net payout.

Administrators can issue partial or full refunds to individual orders or all orders in case of cancellation. When refunds are triggered, buyers are notified automatically and, if NFTs are used, the tokens are burned or marked invalid.

Unchained supports self‑service upgrades and returns for attendees, with a configurable return policy, similar to the exchanges/returns capability in other ticketing platforms
ticketor.com
.

Conclusion

This epic decomposes the onboarding requirements into actionable user stories with measurable acceptance criteria. It ensures that Unchained matches or surpasses the capabilities of incumbent ticketing platforms while leveraging NFT technology to enhance fan engagement and provide organizers with new revenue opportunities. By addressing these stories, the development team can build a comprehensive venue‑onboarding experience that delivers low friction, robust functionality and a clear competitive advantage.
