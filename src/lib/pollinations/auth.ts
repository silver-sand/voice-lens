const PUBLISHED_APP_KEY = import.meta.env.VITE_POLLINATIONS_APP_KEY || 'your-published-app-key';
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/callback`;

interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(hash);
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer);
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array.buffer);
}

export async function generatePKCE(): Promise<PKCEChallenge> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Store verifier and state in sessionStorage for callback validation
  sessionStorage.setItem('pollinations_code_verifier', codeVerifier);
  sessionStorage.setItem('pollinations_state', state);

  return { codeVerifier, codeChallenge, state };
}

export function buildAuthUrl(codeChallenge: string, state: string): string {
  const params = new URLSearchParams({
    client_id: PUBLISHED_APP_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    scope: 'pollinations:generate',
  });

  return `https://gen.pollinations.ai/auth?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, providedState: string): Promise<string> {
  const storedState = sessionStorage.getItem('pollinations_state');
  const codeVerifier = sessionStorage.getItem('pollinations_code_verifier');

  if (!storedState || storedState !== providedState) {
    throw new Error('Invalid OAuth state - possible CSRF attack');
  }

  if (!codeVerifier) {
    throw new Error('Missing PKCE code verifier');
  }

  const formData = new URLSearchParams();
  formData.append('client_id', PUBLISHED_APP_KEY);
  formData.append('code', code);
  formData.append('redirect_uri', REDIRECT_URI);
  formData.append('grant_type', 'authorization_code');
  formData.append('code_verifier', codeVerifier);

  const response = await fetch('https://gen.pollinations.ai/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error('No access token in response');
  }

  // Store the access token (sk_ key) in sessionStorage
  sessionStorage.setItem('pollinationsAccessToken', data.access_token);

  // Clean up PKCE values
  sessionStorage.removeItem('pollinations_code_verifier');
  sessionStorage.removeItem('pollinations_state');

  return data.access_token;
}

export function getStoredToken(): string | null {
  return sessionStorage.getItem('pollinationsAccessToken');
}

export function clearStoredToken(): void {
  sessionStorage.removeItem('pollinationsAccessToken');
}

export function isConnected(): boolean {
  return !!getStoredToken();
}

export function getAppKey(): string {
  return PUBLISHED_APP_KEY;
}

export function getRedirectUri(): string {
  return REDIRECT_URI;
}