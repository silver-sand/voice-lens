# BYOP Security Review Report

**Date:** 2026-11-08  
**Project:** Voice Lens  
**Auditor:** Phase 4 Final Polish  
**Scope:** `src/lib/pollinations/auth.ts`, `src/hooks/usePollinationsAuth.ts`, `src/components/BYOPSection/`

---

## Executive Summary

The BYOP (Bring Your Own Pollinations) OAuth implementation follows security best practices for PKCE (Proof Key for Code Exchange) flow with S256 challenge method. **Overall status: SECURE** — no critical vulnerabilities found. Minor hardening recommendations provided.

---

## PKCE Flow Implementation Review

### ✅ Strengths

| Area | Implementation | Status |
|------|----------------|--------|
| **Code Verifier Generation** | 32 bytes crypto-random (`Uint8Array(32)`) | ✅ Strong |
| **Code Challenge Method** | S256 (SHA-256) via `crypto.subtle.digest` | ✅ Recommended |
| **State Parameter** | 16 bytes crypto-random, validated on callback | ✅ CSRF protection |
| **Storage** | `sessionStorage` (ephemeral, cleared on tab close) | ✅ Appropriate |
| **Token Storage** | Access token in `sessionStorage` only | ✅ Not persisted |
| **PKCE Cleanup** | Verifier/state removed after token exchange | ✅ No reuse risk |
| **Env Var Handling** | Lazy getters at call time (not module load) | ✅ Safe for GitHub Pages |

### PKCE Flow Code Review

```typescript
// src/lib/pollinations/auth.ts - Key security functions

// 1. Code Verifier: 32 bytes cryptographically random
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer);
}

// 2. Code Challenge: SHA-256 (S256)
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(hash);
}

// 3. State: 16 bytes cryptographically random
function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer);
}

// 4. State Validation on Callback
const storedState = sessionStorage.getItem('pollinations_state');
if (!storedState || storedState !== providedState) {
  throw new Error('Invalid OAuth state - possible CSRF attack');
}

// 5. Token Exchange with PKCE Verifier
formData.append('code_verifier', codeVerifier); // Sent to token endpoint
```

---

## Token Storage Analysis

### Current Implementation
- **Access Token**: Stored in `sessionStorage` under key `pollinationsAccessToken`
- **Lifetime**: Session-only (cleared when tab/window closes)
- **Scope**: `pollen:generate` (read-only analysis, no write permissions)

### Security Properties ✅
| Property | Status | Notes |
|----------|--------|-------|
| Not in `localStorage` | ✅ | No cross-session persistence |
| Not in cookies | ✅ | No CSRF risk from cookie theft |
| HttpOnly equivalent | ✅ | `sessionStorage` not accessible to JS from other origins |
| Automatic cleanup | ✅ | Tab close clears all sessionStorage |
| No refresh token | ✅ | Reduces blast radius; re-auth required |

### Recommendations
| Rec | Priority | Rationale |
|-----|----------|-----------|
| Consider short-lived access token validation | Low | Add timestamp to detect stale tokens; re-auth if >1hr |
| Add token expiration check before API calls | Low | Prevent 401 errors from expired tokens |

---

## Hardcoded Secrets Check

### ✅ No Hardcoded Secrets Found

| File | Check | Result |
|------|-------|--------|
| `src/lib/pollinations/auth.ts` | App key, redirect URI, client secret | ✅ All from `import.meta.env` |
| `src/hooks/usePollinationsAuth.ts` | No secrets | ✅ Clean |
| `src/components/BYOPSection/*.tsx` | No secrets | ✅ Clean |
| `vite.config.ts` | No secrets in build config | ✅ Clean |
| `.env*` files | Not committed (gitignored) | ✅ Verified |

### Environment Variables Used
```bash
VITE_POLLINATIONS_APP_KEY   # Public client ID (safe in client bundle)
VITE_REDIRECT_URI           # Public redirect URI (safe in client bundle)
```

**Note:** These are `VITE_*` prefixed, meaning they are intentionally exposed to the client bundle. This is correct for OAuth public clients (SPA). No `VITE_` secret should ever be a secret — the PKCE flow protects the authorization code.

---

## CSRF Protection

### ✅ State Parameter Validation
```typescript
// src/lib/pollinations/auth.ts:90-95
const storedState = sessionStorage.getItem('pollinations_state');
if (!storedState || storedState !== providedState) {
  throw new Error('Invalid OAuth state - possible CSRF attack');
}
```

### ✅ Additional Protections
| Protection | Implementation |
|------------|----------------|
| State generated per-auth-request | `generateState()` called in `generatePKCE()` |
| State stored in sessionStorage | Not accessible cross-origin |
| State validated before token exchange | Prevents authorization code injection |
| State cleaned after use | `sessionStorage.removeItem('pollinations_state')` |

---

## OAuth Configuration Validation

### ✅ Runtime Configuration Checks
```typescript
// All public functions validate configuration before proceeding
export function isAuthConfigured(): boolean {
  return !!getEnvAppKey() && !!getEnvRedirectUri();
}

export async function generatePKCE(): Promise<PKCEChallenge> {
  if (!isAuthConfigured()) {
    throw new Error('OAuth not configured...');
  }
  // ...
}
```

### Behavior When Unconfigured
- `isConfigured` state returned to UI (shows "Not configured" message)
- Connect button disabled when `!isConfigured`
- Clear error message guides developer to set env vars

---

## Token Usage in Application

### Current Usage
```typescript
// ConnectionCard.tsx:119-121
{isConnected && accessToken && (
  <span className="font-mono text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
    {accessToken.slice(0, 8)}...{accessToken.slice(-4)}
  </span>
)}
```

### Security Assessment
| Aspect | Status | Notes |
|--------|--------|-------|
| Token display | ✅ Masked | Only first 8 + last 4 chars shown |
| Token in logs | ✅ None | No `console.log` of token |
| Token in network tab | ✅ Only in auth flow | Token exchange POST, then stored locally |
| Token sent to Pollinations | ✅ Authorization header | Used for `pollen:generate` scope only |

---

## Network Security

### Token Exchange Endpoint
```
POST https://enter.pollinations.ai/api/oauth/token
Content-Type: application/x-www-form-urlencoded
```

### Request Body (No Secrets Exposed)
| Parameter | Source |
|-----------|--------|
| `client_id` | `VITE_POLLINATIONS_APP_KEY` (public) |
| `code` | From OAuth callback (single-use) |
| `redirect_uri` | `VITE_REDIRECT_URI` (public) |
| `grant_type` | `authorization_code` |
| `code_verifier` | PKCE verifier (proves possession) |

**No client secret sent** — correct for public client (SPA) with PKCE.

---

## Error Handling

### ✅ No Information Leakage
| Error Type | Handling |
|------------|----------|
| Invalid state | Generic "Invalid OAuth state" message |
| Token exchange failure | Status + response text (server-controlled) |
| Missing PKCE verifier | Generic "Missing PKCE code verifier" |
| Network failure | Generic "Failed to initiate authentication" |

No stack traces, internal URLs, or configuration details leaked to user.

---

## Accessibility & Security Overlap

| Feature | Security Benefit |
|---------|------------------|
| `aria-busy` on loading button | Prevents double-click during auth |
| `disabled` during loading | Prevents re-entrancy |
| Error `role="alert"` + `aria-live="assertive"` | Immediate screen reader announcement |
| Focus management | Keyboard users can complete flow |

---

## Recommendations Summary

| Priority | Recommendation | Effort |
|----------|----------------|--------|
| **P1** | Add token timestamp + expiry check (1hr) | Low |
| **P2** | Add `Content-Security-Policy` header (see `web/security.md`) | Medium |
| **P2** | Consider `Referrer-Policy: strict-origin-when-cross-origin` | Low |
| **P3** | Add rate limiting UI feedback (disable connect after N attempts) | Low |

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| PKCE with S256 | ✅ |
| State parameter (CSRF) | ✅ |
| No hardcoded secrets | ✅ |
| Tokens in sessionStorage only | ✅ |
| No refresh tokens stored | ✅ |
| Public client (no client_secret) | ✅ |
| Scope limitation (`pollen:generate`) | ✅ |
| Error messages don't leak internals | ✅ |
| Lazy env var loading | ✅ |
| Clean URL after auth (replaceState) | ✅ |

---

## Conclusion

The BYOP OAuth implementation is **production-ready** from a security perspective. It correctly implements PKCE for a public SPA client, uses ephemeral sessionStorage for tokens, validates state to prevent CSRF, and exposes no secrets. The minor recommendations above are defense-in-depth improvements, not blockers.

**Sign-off:** ✅ Approved for deployment (with explicit user approval per Phase 4 constraints).