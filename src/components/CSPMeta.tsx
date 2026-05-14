'use client';

// FIX S4: Content Security Policy meta tag
// For static exports, CSP must be in HTML meta tag (not HTTP headers)

const CSP_META = {
  defaultSrc: "'self'",
  scriptSrc: "'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
  styleSrc: "'self' 'unsafe-inline' https://fonts.googleapis.com",
  fontSrc: "'self' https://fonts.gstatic.com",
  imgSrc: "'self' data: https: blob:",
  connectSrc: "'self' https://www.google-analytics.com https://analytics.google.com",
  frameSrc: "'none'",
  objectSrc: "'none'",
  baseUri: "'self'",
  formAction: "'self'",
  frameAncestors: "'none'",
  upgradeInsecureRequests: '',
};

export default function CSPMeta() {
  const cspValue = Object.entries(CSP_META)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${key} ${value}`)
    .join('; ');

  return (
    <meta
      httpEquiv="Content-Security-Policy"
      content={cspValue}
    />
  );
}