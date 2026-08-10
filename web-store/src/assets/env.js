window.__env = {
  apiUrl: ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:4242'
    : window.location.origin
};
