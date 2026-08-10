window.__env = {
  apiUrl: ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? `${window.location.protocol}//${window.location.hostname}:4242`
    : window.location.origin,
  checkoutEnabled: false
};
