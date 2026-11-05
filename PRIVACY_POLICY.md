# Privacy Policy — Voice Lens

**Last Updated:** November 5, 2026
**Version:** 1.0

---

## Overview

Voice Lens ("the App", "we", "us") is a writing-style analysis tool built for the Pollinations Quest #19180. This privacy policy explains how we handle your data when you use the App.

**TL;DR:** Your text stays in your browser. We don't collect, store, or transmit your writing unless you explicitly choose to connect a Pollen account and run AI interpretation.

---

## Data We Process

### 1. Local Analysis Data (Never Leaves Your Browser)
When you type in the editor and click "Analyze Style", the following happens **entirely in your browser**:

- Your text is analyzed by deterministic algorithms (repetition detection, formulaic phrase matching, sentence structure analysis, transition counting, vocabulary diversity)
- No network requests are made
- No data is sent to any server
- Results are displayed immediately in the Analysis Panel
- When you close the tab, all data is gone

**We cannot see, access, or recover this data.**

### 2. Pollinations BYOP Data (Only If You Connect Pollen)
If you click "Connect Pollen" and complete the OAuth flow:

| Data | Purpose | Storage |
|------|---------|---------|
| **OAuth Access Token** | Authenticate requests to Pollinations API | `sessionStorage` only (cleared on tab close) |
| **Your Text + Local Findings** | Sent to Pollinations for AI interpretation & rewrite | Transmitted via HTTPS to `api.pollinations.ai` |
| **Pollinations Response** | Explanation, rewrite, key insights, confidence | Held in memory during session |

**You control this entirely:**
- Connection is opt-in — local analysis works without it
- Disconnect anytime — clears token from `sessionStorage`
- No background sync, no periodic polling

### 3. No Analytics, No Tracking, No Cookies
- We do **not** use Google Analytics, Mixpanel, or any analytics platform
- We do **not** set cookies
- We do **not** fingerprint your browser
- We do **not** log IP addresses or usage metrics

---

## Data Storage

### `sessionStorage` Only
- OAuth access token stored in `sessionStorage` under key `pollinationsAccessToken`
- **Never** stored in `localStorage`
- **Never** written to disk
- **Automatically cleared** when you close the browser tab/window
- **Not accessible** to other tabs or sessions

### No Server-Side Storage
- We operate no backend servers
- No database stores your text, tokens, or analysis results
- The App is a static frontend deployed to a CDN (e.g., Vercel, Netlify, GitHub Pages)

---

## Third-Party Services

### Pollinations API
When you connect Pollen and run analysis:

- **Endpoint:** `https://api.pollinations.ai/v1/chat/completions`
- **Data sent:** Your text + local analysis findings (JSON)
- **Authentication:** Bearer token (your OAuth access token)
- **Protocol:** HTTPS (TLS 1.2+)
- **Pollinations' Privacy Policy:** [pollinations.ai/privacy](https://pollinations.ai/privacy)

We have no control over how Pollinations processes your request once received. Review their privacy policy for details.

### Pollinations OAuth (Pollen)
- **Authorization Endpoint:** `https://auth.pollinations.ai/oauth/authorize`
- **Token Endpoint:** `https://auth.pollinations.ai/oauth/token`
- **Flow:** OAuth 2.0 Authorization Code with PKCE (S256)
- **Scope Requested:** `chat:write` (for model access)

---

## Your Rights

Since we don't store your data, traditional data rights work differently:

| Right | How It Applies |
|-------|----------------|
| **Access** | Your data never leaves your browser — you already have full access |
| **Rectification** | Edit your text in the editor; re-analyze anytime |
| **Erasure** | Close the tab — all session data is gone |
| **Portability** | Use "Export" button to download analysis as JSON |
| **Restriction** | Don't connect Pollen — use local analysis only |
| **Objection** | Simply don't use the AI interpretation feature |

---

## Children's Privacy

Voice Lens is not directed at children under 13. We do not knowingly collect data from children. If you're a parent/guardian and believe your child has used the App with Pollen connected, contact us and we'll guide you through disconnecting.

---

## Security

- **HTTPS Only** — All external requests use TLS
- **PKCE (S256)** — OAuth code challenge prevents authorization code interception
- **No Token Logging** — Tokens never appear in console logs
- **CSP Compatible** — No inline scripts, works with strict Content Security Policy
- **Dependency Auditing** — `npm audit` run before releases

---

## Changes to This Policy

We may update this policy as the App evolves. Changes will be posted here with an updated "Last Updated" date. Continued use after changes constitutes acceptance.

---

## Contact

For privacy questions or concerns:

- **GitHub Issues:** [Repository Issues](https://github.com/pollinations/pollinations/issues) (tag with `voice-lens`)
- **Pollinations Discord:** #quest-19180 channel

---

## Compliance Notes

- **GDPR:** No personal data processed by us; Pollinations acts as independent controller for AI requests
- **CCPA:** No "sale" of personal information; no data broker activity
- **ePrivacy:** No cookies, no tracking, no unsolicited communications

---

*Voice Lens is an open-source project submitted for Pollinations Quest #19180. This privacy policy reflects the architecture as of the version submitted.*