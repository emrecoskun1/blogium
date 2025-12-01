export const environment = {
  production: true,
  apiUrl: '/api', // Nginx will proxy to backend
  apiTimeout: 30000,
  enableLogging: false,
  cookieSecure: true, // HTTPS enabled for blogium.yunusemrecoskun.xyz
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  cacheTimeout: 5 * 60 * 1000 // 5 minutes
};
