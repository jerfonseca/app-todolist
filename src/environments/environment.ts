const runtimeWindow = typeof window !== 'undefined'
  ? (window as unknown as { __env?: { API_BASE_URL?: string } })
  : undefined;

export const environment = {
  production: false,
  apiBaseUrl: runtimeWindow?.__env?.API_BASE_URL || 'https://api.example.com'
};