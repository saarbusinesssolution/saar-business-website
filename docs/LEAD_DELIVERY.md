# Lead Delivery & Enquiry Architecture

This document describes the serverless enquiry pipeline, email provider configuration, security controls, and operational procedures for **SAAR Business Support Solution** (`saarbusiness.com`).

---

## 1. Architectural Overview

SAAR uses a secure, stateless, serverless enquiry pipeline deployed to **Cloudflare Pages Functions** with transactional email relay via **Resend**.

### Key Principles
1. **Stateless Edge Execution**: The server endpoint does not store enquiries in a database or local filesystem. Enquiries are validated, sanitized, and forwarded directly to the configured recipient via transactional email.
2. **Zero-Fabrication Guarantee**: The system never simulates successful delivery when external credentials or services are missing. If production credentials are not configured, the server fails closed with HTTP 503 (`Service Unavailable`).
3. **Truthful Success Messaging**: The visitor UI states *"Your enquiry has been submitted"* alongside a unique enquiry reference code (e.g., `SR-9X2K4A`). It explicitly clarifies that the architectural team evaluates briefs sequentially, rather than claiming instant receipt or unverified read status.
4. **Privacy-Conscious Handoff**: Project briefs generated via `/plan-my-project/` are handed over to `/contact/` strictly through in-memory JavaScript state (`window.__SAAR_ACTIVE_BRIEF__`). No personal contact data or project briefs are ever passed in URL query strings, cookies, or browser storage.

---

## 2. Infrastructure & Environment Configuration

### Environment Variables & Secrets
All secrets are resolved at the server boundary and must never be exposed to client-side bundles.

| Variable Name | Environment | Required | Description |
| :--- | :--- | :--- | :--- |
| `RESEND_API_KEY` | Server / Edge | Yes (Prod) | API key generated from Resend account (`re_...`). |
| `ENQUIRY_SENDER_EMAIL` | Server / Edge | Yes (Prod) | Verified sender address (e.g., `SAAR Studio <enquiries@saarbusiness.com>`). |
| `ENQUIRY_RECIPIENT_EMAIL` | Server / Edge | Yes | Primary studio destination for client briefs (e.g., `hello@saarbusiness.com`). |
| `TURNSTILE_SITE_KEY` | Client & Server | Optional | Cloudflare Turnstile public site key for bot verification. |
| `TURNSTILE_SECRET_KEY` | Server / Edge | Optional | Cloudflare Turnstile server secret key for token validation. |
| `ENABLE_TEST_MOCK_DELIVERY` | Dev / CI Only | No | Set to `"true"` exclusively during local automated testing or CI suites. |

### Cloudflare Pages Bindings
* **Pages Function Route**: `functions/api/enquiry.ts` is automatically mapped by Cloudflare Pages to `POST /api/enquiry`.
* **Rate Limiting KV (Optional)**: Cloudflare KV binding named `RATE_LIMIT_KV`. When bound, rate limits are coordinated across edge points. When absent, the system falls back to an in-memory sliding window cache.

---

## 3. Pipeline Security & Protection Measures

The request handler (`src/lib/server/enquiry-handler.ts`) executes a strict defense-in-depth sequence before invoking the email relay:

1. **HTTP Method & Content-Type Guards**: Rejects any non-POST requests with HTTP 405 (`Method Not Allowed`) and non-JSON payloads with HTTP 415 (`Unsupported Media Type`).
2. **Payload Size Limitation**: Rejects requests exceeding 64 KB with HTTP 413 (`Payload Too Large`) to protect against buffer exhaustion attacks.
3. **Sliding-Window Rate Limiting**: Enforces a strict threshold of **5 requests per 10 minutes** per IP address. Client IP addresses are hashed using SHA-256 with a daily rotating salt to prevent plain-text IP logging.
4. **Honeypot Anti-Spam Gate**: Inspects a hidden form input (`website_url`). If populated by automated form scrapers, the request is immediately rejected with HTTP 400 (`Bad Request`).
5. **Cloudflare Turnstile Bot Verification**: If `TURNSTILE_SECRET_KEY` is present, the client `turnstileToken` is verified against Cloudflare's `siteverify` API endpoint.
6. **Strict Zod Schema Validation**:
   - Sanitizes email headers against CRLF injection (`\r`, `\n`).
   - Escapes special characters (`<`, `>`, `&`, `"`, `'`) in HTML email bodies to prevent cross-site scripting (XSS).
   - Validates telephone format against international dial patterns.
   - Enforces discipline selection or structured project brief schema.
   - Requires explicit privacy acknowledgement.
7. **Idempotency Header**: Client generates a unique `submissionId` per form session and passes it as an `Idempotency-Key` header to Resend, preventing duplicate email dispatch during mobile network retries.

---

## 4. Local Development & Automated Testing

### Astro Local Development
In local development (`npm run dev`), Astro does not run Cloudflare Pages Functions natively. Instead, the project includes an embedded dev middleware in `astro.config.mjs` (`devEnquiryApi`) that mounts the exact same `handleEnquiryRequest` at `/api/enquiry`.

### Automated Integration Suite
Run the 32-scenario API test suite locally:
```bash
npm run test:api
```
This tests:
- Valid email and phone submission paths
- Project planner brief handoff payloads
- Missing field handling and malformed email/phone rejection
- Request size limit enforcement (64 KB)
- Honeypot trapping
- Rate limiter exhaustion (HTTP 429)
- Fail-closed behavior on missing production credentials (HTTP 503)
- HTML injection and CRLF header injection mitigation

---

## 5. Production Readiness & Deployment Checklist

Before launching lead delivery in production:

1. **Verify Sender Domain**: In the Resend dashboard, add and verify DNS records (DKIM, SPF, DMARC) for `saarbusiness.com`.
2. **Configure Cloudflare Secrets**:
   - In Cloudflare Pages project settings > **Settings** > **Environment variables**, configure:
     - `RESEND_API_KEY`
     - `ENQUIRY_SENDER_EMAIL` (e.g. `enquiries@saarbusiness.com`)
     - `ENQUIRY_RECIPIENT_EMAIL` (e.g. `hello@saarbusiness.com`)
     - `TURNSTILE_SITE_KEY` (if active)
     - `TURNSTILE_SECRET_KEY` (if active)
   - Ensure `ENABLE_TEST_MOCK_DELIVERY` is **NEVER** set in production.
3. **Optional KV Namespace**: Create a KV namespace named `saar-rate-limits` and bind it to variable `RATE_LIMIT_KV` in Cloudflare Pages.
4. **Authorized Live Delivery Test**:
   - After deploying to staging or production, conduct **one** authorized manual test with explicit team coordination.
   - Verify that the notification email arrives in `hello@saarbusiness.com` with correct reference code, client contact info, and attached project brief (if from planner).
   - Verify that the reply-to header is correctly set to the client's email address.

---

## 6. Privacy & Data Retention Decisions

* **Client Browser**: No customer data is retained in `localStorage` or `sessionStorage`. Resetting or navigating away safely frees the memory.
* **Serverless Edge**: No database writes occur. Cloudflare function execution logs do not record visitor names, phone numbers, email addresses, or spatial brief details.
* **Email Transmission**: All correspondence is transmitted via TLS to Resend and delivered to the studio's email server.
