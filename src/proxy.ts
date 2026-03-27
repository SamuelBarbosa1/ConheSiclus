import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'siclus_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback_secret';

// Helper to convert hex to ArrayBuffer (for Web Crypto API)
function hexToBuffer(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

async function verifySession(token: string) {
  try {
    const [payloadBase64, signature] = token.split('.');
    
    // In Edge Runtime, atob is available globally
    const payloadJson = atob(payloadBase64);
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SESSION_SECRET);
    const payloadData = encoder.encode(payloadJson);
    const signatureData = hexToBuffer(signature);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureData,
      payloadData
    );

    if (isValid) {
      return JSON.parse(payloadJson);
    }
  } catch (e) {
    console.error('Error verifying session in proxy:', e);
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const session = await verifySession(token);
    if (!session || session.expires < Date.now()) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
