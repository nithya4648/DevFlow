export const retryConfig = { maxAttempts: 4, initialDelay: 1000, maxDelay: 5000, backoffMultiplier: 2 };
export const shouldRetry = (e) => !e.response || e.response?.status >= 500 || e.code === "ECONNABORTED" || e.code === "ECONNREFUSED";
export const delay = (ms) => new Promise(r => setTimeout(r, ms));
export const retryRequest = async (fn, c = retryConfig) => {
  for (let i = 0; i < c.maxAttempts; i++) {
    try { return await fn(); }
    catch (e) {
      if (!shouldRetry(e) || i === c.maxAttempts - 1) throw e;
      await delay(Math.min(c.initialDelay * Math.pow(c.backoffMultiplier, i), c.maxDelay));
    }
  }
};
