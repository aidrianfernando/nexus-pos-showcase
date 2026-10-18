import axios from 'axios';

const DEFAULT_TIMEOUT_MS = 20000;
const MAX_SAFE_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 250;
const MAX_RETRY_DELAY_MS = 2000;
const RETRYABLE_STATUS_CODES = new Set([
  408,
  425,
  429,
  502,
  503,
  504,
]);

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback;
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function parseRetryAfterMs(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.ceil(seconds * 1000);
  }

  const dateMs = Date.parse(String(value));
  if (!Number.isFinite(dateMs)) {
    return null;
  }

  return Math.max(0, dateMs - Date.now());
}

function isSafeRetryMethod(method) {
  const normalized = String(method || 'get').toUpperCase();
  return normalized === 'GET' || normalized === 'HEAD';
}

function shouldRetry(error) {
  if (!error?.config || !isSafeRetryMethod(error.config.method)) {
    return false;
  }

  if (error.code === 'ERR_CANCELED') {
    return false;
  }

  if (!error.response) {
    return true;
  }

  return RETRYABLE_STATUS_CODES.has(error.response.status);
}

function getRetryDelayMs(error, retryCount) {
  const retryAfterHeader =
    error.response?.headers?.['retry-after'];
  const retryAfterMs = parseRetryAfterMs(retryAfterHeader);

  if (retryAfterMs !== null) {
    return retryAfterMs <= MAX_RETRY_DELAY_MS
      ? retryAfterMs
      : null;
  }

  const exponential = Math.min(
    MAX_RETRY_DELAY_MS,
    BASE_RETRY_DELAY_MS * (2 ** retryCount)
  );
  const jitter = Math.floor(Math.random() * 250);

  return Math.min(MAX_RETRY_DELAY_MS, exponential + jitter);
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: parsePositiveInteger(
    import.meta.env.VITE_API_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS
  ),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('nexus_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('nexus_token');
      sessionStorage.removeItem('nexus_user');

      window.dispatchEvent(
        new Event('nexus:unauthorized')
      );
    }

    const requestConfig = error.config;
    const retryCount = requestConfig?.__nexusRetryCount || 0;

    if (
      !requestConfig ||
      !shouldRetry(error) ||
      retryCount >= MAX_SAFE_RETRIES
    ) {
      return Promise.reject(error);
    }

    requestConfig.__nexusRetryCount = retryCount + 1;

    const retryDelayMs = getRetryDelayMs(error, retryCount);

    if (retryDelayMs === null) {
      return Promise.reject(error);
    }

    await sleep(retryDelayMs);
    return api.request(requestConfig);
  }
);

export default api;
